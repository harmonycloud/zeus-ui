import React, { useState, useEffect } from 'react';
import styles from './esEdit.module.scss';
import G6 from '@antv/g6';
import { Button, Icon, Balloon } from '@alicloud/console-components';
import CustomIcon from '@/components/CustomIcon';
import { api } from '@/api.json';
import select from '@/assets/images/tree-select.svg';
import Completed from '@/assets/images/Completed.svg';
import NotReady from '@/assets/images/NotReady.svg';
import Terminating from '@/assets/images/Terminating.svg';
import Running from '@/assets/images/Running.svg';
import Restart from '@/assets/images/restart.svg';
import Edit from '@/assets/images/edit.svg';
import Control from '@/assets/images/control.svg';
import { useLocation } from 'react-router';
import { Message } from '@alicloud/console-components';
import messageConfig from '@/components/messageConfig';
import insertCss from 'insert-css';
import { type } from 'os';

insertCss(`
.tooltip {
  background-color: #fff;
  padding: 10px;
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;
  width: fit-content;
  color: #333;
  border-radius = 4px;
}
.mini-view {
	box-shadow: 0px 2px 6px 6px rgba(198, 198, 198, 0.5);
	border-radius: 4px;
	border: 1px solid #979797;
	outline: none !important;
}
.g6-minimap{
	position: absolute;
	top: 50px;
	right: 10px;
}
`);

const { Tooltip } = Balloon;

const podStatus = [
	{
		status: 'Completed',
		color: '#1E8E3E',
		image: Completed,
		title: '即将完成'
	},
	{
		status: 'Terminating',
		color: '#D93026',
		image: Terminating,
		title: '已停止'
	},
	{
		status: 'Running',
		color: '#0091FF',
		image: Running,
		title: '运行中'
	},
	{
		status: 'NotReady',
		color: '#FFC440',
		image: NotReady,
		title: '运行异常'
	},
	{
		status: 'Creating',
		color: '#1E8E3E',
		image: Completed,
		title: '即将完成'
	},
	{
		status: 'RunningError',
		color: '#FFC440',
		image: NotReady,
		title: '运行异常'
	}
];

const modelMap = {
	MasterSlave: '主从模式',
	'1m-1s': '主从模式',
	simple: 'N主',
	complex: 'N主N数据N协调',
	regular: 'N主N数据',
	sentinel: '哨兵',
	'2m-noslave': '两主',
	'2m-2s': '两主两从',
	'3m-3s': '三主三从',
	null: '未知'
};

function Visualization(props) {
	const {
		topoData,
		serverData,
		setBackupObj,
		isEdit,
		openSSL,
		reStart,
		editConfiguration,
		setEsVisible,
		selectObj,
		backup,
		record
	} = props;
	const location = useLocation();
	const { pathname } = location;
	const [option, setOption] = useState();
	const [treeOption, setTreeOption] = useState();
	const [direction, setDirection] = useState('LR');

	const roleRender = (value, index, record) => {
		// console.log(record, 'ppp', value);
		if (record.podName.includes('exporter')) {
			return 'exporter';
		} else {
			if (serverData.type === 'elasticsearch') {
				if (record.podName.includes('kibana')) {
					return 'kibana';
				} else if (record.podName.includes('client')) {
					return '协调节点';
				} else if (record.podName.includes('master')) {
					return '主节点';
				} else if (record.podName.includes('data')) {
					return '数据节点';
				} else if (record.podName.includes('cold')) {
					return '冷节点';
				}
			} else {
				switch (value) {
					case 'master':
						return '主节点';
					case 'slave':
						return '从节点';
					case 'data':
						return '数据节点';
					case 'client':
						return '协调节点';
					case 'cold':
						return '冷节点';
					case 'kibana':
						return 'kibana';
					case 'nameserver':
						return 'nameserver';
					case 'exporter':
						return 'exporter';
					default:
						return '未知';
				}
			}
		}
	};

	const serveRender = () => {
		return serverData.type !== 'redis'
			? modelMap[serverData.mode]
			: serverData.mode === 'sentinel'
			? '哨兵'
			: serverData.quota.redis.num === 6
			? '三主三从'
			: '五主五从' || '';
	};

	const hasConfigBackup = (cfg) => {
		if (!cfg.depth) {
			if (serverData.hasConfigBackup) {
				return true;
			} else {
				return false;
			}
		} else {
			if (cfg.hasConfigBackup) {
				return true;
			} else {
				return false;
			}
		}
	};

	const isSelect = (cfg) => {
		if (!isEdit) {
			if (hasConfigBackup(cfg)) {
				return false;
			} else {
				return true;
			}
		} else {
			if (backup) {
				if (serverData.name === selectObj) {
					if (serverData.type === 'mysql') {
						return !cfg.depth ? true : false;
					} else {
						return true;
					}
				} else {
					if (!cfg.depth) {
						return false;
					} else {
						if (cfg.podName === selectObj) {
							return true;
						} else {
							return false;
						}
					}
				}
			} else {
				if (!cfg.depth) {
					if (cfg.name === selectObj) {
						return true;
					} else {
						return false;
					}
				} else {
					if (cfg.podName === selectObj) {
						return true;
					} else {
						return false;
					}
				}
			}
		}
	};

	useEffect(() => {
		let url = window.location.href.split('/');
		let imagePath =
			url[url.length - 2] + '-' + url[url.length - 1] + '.svg';

		G6.registerNode(
			'tree-node',
			{
				drawShape: function drawShape(cfg, group) {
					console.log(cfg, serverData, group);
					if (cfg.adentify) {
						// console.log(cfg.level, cfg.adentify);
						const circle = group.addShape('rect', {
							attrs: {
								stroke: '#666',
								fill: '#fff',
								width: 60,
								height: 30,
								radius: 15,
								y: 35,
								x: cfg.level === 'pod' ? 30 : 0,
								cursor: 'pointer'
							},
							modelId: cfg.id,
							name: 'circle'
						});
						group.addShape('text', {
							attrs: {
								text:
									cfg.level === 'serve'
										? cfg.adentify
										: roleRender(cfg.adentify, '', cfg),
								fill: 'rgba(0, 0, 0, .65)',
								fontSize: 10,
								textAlign: 'center',
								width: 60,
								height: 30,
								x: cfg.level === 'pod' ? 60 : 30,
								y: 55
							},
							modelId: cfg.id,
							name: 'circle-text'
						});
						// if (cfg.level === 'serve') {
						// 	group.addShape('rect', {
						// 		attrs: {
						// 			stroke: '#A3B1BF',
						// 			x: 60,
						// 			y: 50,
						// 			width: 26,
						// 			height: 0
						// 		},
						// 		name: 'serve-line'
						// 	});
						// }
						// if (cfg.level === 'pod') {
						// 	group.addShape('rect', {
						// 		attrs: {
						// 			stroke: '#A3B1BF',
						// 			x: 90,
						// 			y: 50,
						// 			width: 90,
						// 			height: 0
						// 		},
						// 		name: 'pod-line'
						// 	});
						// }
						if (cfg.children && cfg.children.length) {
							group.addShape('rect', {
								attrs: {
									x: cfg.level === 'serve' ? 87 : 168,
									y: 42,
									width: 16,
									height: 16,
									radius: 8,
									stroke: 'rgba(0, 0, 0, 0.25)',
									cursor: 'pointer',
									fill: '#fff'
								},
								name: 'collapse-back',
								modelId: cfg.id
							});
							group.addShape('text', {
								attrs: {
									x: cfg.level === 'serve' ? 95 : 176,
									y: 48,
									textAlign: 'center',
									textBaseline: 'middle',
									text: '-',
									fontSize: 16,
									cursor: 'pointer',
									fill: 'rgba(0, 0, 0, 0.25)'
								},
								name: 'collapse-text',
								modelId: cfg.id
							});
						}
						return circle;
					} else {
						const box = group.addShape('rect', {
							attrs: {
								fill: isSelect(cfg) ? '#fff' : '#EBEBEB',
								stroke: '#666',
								x: 0,
								y: 0,
								width: 228,
								height: 100,
								opacity: isSelect(cfg) ? 1 : 0.6
							},
							name: 'rect-shape'
						});
						group.addShape('rect', {
							attrs: {
								fill: podStatus.filter(
									(item) =>
										item.status === cfg.status ||
										item.status === serverData.status
								)[0]
									? podStatus.filter(
											(item) =>
												item.status === cfg.status ||
												item.status ===
													serverData.status
									  )[0].color
									: '#FFC440',
								x: 0,
								y: 0,
								width: 40,
								height: 100,
								cursor: 'pointer'
							},
							name: 'status'
						});
						group.addShape('image', {
							attrs: {
								img: podStatus.filter(
									(item) =>
										item.status === cfg.status ||
										item.status === serverData.status
								)[0]
									? podStatus.filter(
											(item) =>
												item.status === cfg.status ||
												item.status ===
													serverData.status
									  )[0].image
									: NotReady,
								x: 12,
								y: 42,
								width: 16,
								height: 16,
								cursor: 'pointer'
							},
							name: 'status-image'
						});
						group.addShape('text', {
							attrs: {
								text: !cfg.depth
									? serverData.name
									: 'IP: ' + cfg.podIp,
								x: 45,
								y: !cfg.depth ? 40 : 30,
								textBaseline: 'middle',
								fill: '#333',
								fontWeight: 500,
								lineHeight: 18,
								fontFamily: 'PingFangSC-Medium, PingFang SC'
							},
							name: 'text-shape1'
						});
						if (cfg.depth) {
							group.addShape('text', {
								attrs: {
									text: cfg.podName,
									x: 45,
									y: 50,
									textBaseline: 'middle',
									fill: '#333',
									fontWeight: 500,
									lineHeight: 18,
									fontFamily: 'PingFangSC-Medium, PingFang SC'
								},
								name: 'text-shape3'
							});
						}
						group.addShape('text', {
							attrs: {
								text: !cfg.depth
									? serverData.aliasName
									: '资源/存储: ' +
									  cfg.resources.cpu +
									  'C/' +
									  cfg.resources.memory +
									  'G' +
									  '/' +
									  (cfg.resources.storageClassQuota
											? cfg.resources.storageClassQuota
											: ''),
								x: 45,
								y: !cfg.depth ? 60 : 70,
								textBaseline: 'middle',
								fill: '#666',
								fontWeight: 400
							},
							name: 'text-shape2'
						});
						group.addShape('image', {
							attrs: {
								img: `${api}/images/middleware/${imagePath}`,
								x: 160,
								y: 34,
								width: 32,
								height: 32
							},
							visible: !cfg.depth,
							name: 'type-image'
						});
						group.addShape('rect', {
							attrs: {
								x: 208,
								y: 0,
								width: 20,
								height: 100,
								fill: '#6236FF'
							},
							visible: hasConfigBackup(cfg),
							name: 'right'
						});
						group.addShape('text', {
							attrs: {
								text: '已',
								x: 212,
								y: 42,
								fill: '#fff'
							},
							visible: hasConfigBackup(cfg),
							name: 'text1'
						});
						group.addShape('text', {
							attrs: {
								text: '设',
								x: 212,
								y: 54,
								fill: '#fff'
							},
							visible: hasConfigBackup(cfg),
							name: 'text2'
						});
						group.addShape('text', {
							attrs: {
								text: '置',
								x: 212,
								y: 66,
								fill: '#fff'
							},
							visible: hasConfigBackup(cfg),
							name: 'text3'
						});
						group.addShape('image', {
							attrs: {
								x: 204,
								y: 76,
								width: 24,
								height: 24,
								img: select
							},
							visible:
								record &&
								(cfg.podName === selectObj ||
									selectObj === cfg.name)
									? true
									: false,
							// visible: false,
							name: 'select-image'
						});
						const hasChildren =
							cfg.children && cfg.children.length > 0;
						if (!hasChildren && cfg.depth) {
							group.addShape('rect', {
								attrs: {
									x: 0,
									y: 0,
									width: 76,
									height: 100,
									fill: '#000',
									opacity: 0.65,
									cursor: 'pointer'
								},
								name: 'button1',
								visible: false
							});
							group.addShape('image', {
								attrs: {
									img: Restart,
									x: 19,
									y: 44,
									width: 12,
									height: 12
								},
								visible: false,
								name: 'restart'
							});
							group.addShape('text', {
								attrs: {
									text: '重启',
									x: 46,
									y: 50,
									textAlign: 'center',
									textBaseline: 'middle',
									fill: '#fff',
									cursor: 'pointer'
								},
								name: 'text-button1',
								visible: false
							});
							group.addShape('rect', {
								attrs: {
									x: 76,
									y: 0,
									width: 76,
									height: 100,
									fill: '#000',
									opacity: 0.65,
									cursor: 'pointer'
								},
								visible: false,
								name: 'button2'
							});
							group.addShape('image', {
								attrs: {
									img: Edit,
									x: 82,
									y: 44,
									width: 12,
									height: 12
								},
								visible: false,
								name: 'edit'
							});
							group.addShape('text', {
								attrs: {
									text: '修改规格',
									x: 119,
									y: 50,
									textAlign: 'center',
									textBaseline: 'middle',
									fill: '#fff',
									cursor: 'pointer'
								},
								visible: false,
								name: 'text-button2'
							});
							group.addShape('rect', {
								attrs: {
									x: 152,
									y: 0,
									width: 76,
									height: 100,
									fill: '#000',
									opacity: 0.65,
									cursor: 'pointer'
								},
								visible: false,
								name: 'button3'
							});
							group.addShape('image', {
								attrs: {
									img: Control,
									x: 165,
									y: 44,
									width: 12,
									height: 12
								},
								visible: false,
								name: 'control'
							});
							group.addShape('text', {
								attrs: {
									text: '控制台',
									x: 197,
									y: 50,
									textAlign: 'center',
									textBaseline: 'middle',
									fill: '#fff',
									cursor: 'pointer'
								},
								name: 'text-button3',
								visible: false
							});
						}
						group.addShape('rect', {
							attrs: {
								fill: '#fff',
								stroke: '#ccc',
								x: -20,
								y: 65,
								width: 70,
								height: 25
							},
							name: 'info',
							visible: false
						});
						group.addShape('text', {
							attrs: {
								text: podStatus.filter(
									(item) =>
										item.status === cfg.status ||
										item.status === serverData.status
								)[0]
									? podStatus.filter(
											(item) =>
												item.status === cfg.status ||
												item.status ===
													serverData.status
									  )[0].title
									: '运行异常',
								fill: '#666',
								x: 0,
								y: 83,
								fontWeight: 500,
								lineHeight: 18,
								fontFamily: 'PingFangSC-Medium, PingFang SC'
							},
							name: 'info-text',
							visible: false
						});
						return box;
					}
				}
			},
			'single-node'
		);

		G6.registerEdge('polyline', {
			draw(cfg, group) {
				const startPoint = cfg.startPoint;
				const endPoint = cfg.endPoint;

				const { style } = cfg;
				// console.log(cfg, startPoint, endPoint);
				const shape = group.addShape('path', {
					attrs: {
						stroke: style.stroke,
						path:
							direction === 'LR'
								? [
										['M', startPoint.x, startPoint.y],
										[
											'L',
											endPoint.x / 2 +
												(1 / 2) * startPoint.x,
											startPoint.y
										], // 二分之一处
										[
											'L',
											endPoint.x / 2 +
												(1 / 2) * startPoint.x,
											endPoint.y
										], // 二分之二处
										['L', endPoint.x, endPoint.y]
								  ]
								: [
										['M', startPoint.x, startPoint.y],
										[
											'L',
											endPoint.x / 3 +
												(1 / 4) * startPoint.x,
											startPoint.y
										],
										[
											'L',
											endPoint.x / 3 +
												(1 / 4) * startPoint.x,
											endPoint.y
										], // 二分之二处
										['L', endPoint.x, endPoint.y]
								  ]
					}
				});

				return shape;
			}
		});

		const topology = document.getElementById('topology');
		const minimapDom = document.getElementById('minimap');
		const width = topology.scrollWidth || 800;
		const height = topology.scrollHeight || 480;
		const minimap = new G6.Minimap({
			container: minimapDom,
			size: [217, 142],
			viewportClassName: 'mini-view'
		});
		const graph = new G6.TreeGraph({
			container: 'topology',
			width,
			height,
			fitViewPadding: [20, 30, 20, 30],
			plugins: [minimap],
			modes: {
				default: ['drag-canvas']
			},
			nodeStateStyles: {
				hover: {
					// fill: '#EBEBEB',
					opacity: 0.7
				},
				select: {
					stroke: '#0064C8'
				}
			},
			defaultNode: {
				type: 'tree-node',
				anchorPoints: [
					[0, 0.5],
					[1, 0.5]
				]
			},
			defaultEdge: {
				type: 'polyline',
				style: {
					stroke: '#A3B1BF'
				}
			},
			layout: {
				type: 'compactBox',
				direction: 'LR',
				getId: function getId(d) {
					return d.id;
				},
				getHeight: function getHeight() {
					return 100;
				},
				getWidth: function getWidth(d) {
					return d.level === 'serve' ? 60 : 220;
				},
				getVGap: function getVGap() {
					return 10;
				},
				getHGap: function getHGap(d) {
					return 20;
				}
			}
		});
		const pods = [];
		topoData.pods &&
			topoData.pods.forEach((el) => {
				if (!el.role) el.role = roleRender('', '', el);
				if (pods.every((els) => els.role != el.role))
					pods.push({
						adentify: el.role,
						role: el.role,
						podName: el.podName,
						level: 'pod'
					});
			});
		pods.forEach(
			(el) =>
				(el.children = topoData.pods.filter(
					(els) => els.role == el.role
				))
		);
		const res = {
			id: 'tree',
			name: serverData.name,
			hasConfigBackup: topoData.hasConfigBackup,
			children: [
				{
					adentify: serveRender(),
					level: 'serve',
					children: pods
				}
			]
		};
		// res.children = topoData.pods;
		console.log(res);
		graph.data(res);
		graph.render();
		graph.fitCenter();
		graph.on('node:mouseenter', (evt) => {
			if (!evt.target.cfg.modelId) {
				const { item } = evt;
				const group = item.getContainer();
				const button1 = group.find((e) => e.get('name') === 'button1');
				const button2 = group.find((e) => e.get('name') === 'button2');
				const button3 = group.find((e) => e.get('name') === 'button3');
				const restart = group.find((e) => e.get('name') === 'restart');
				const edit = group.find((e) => e.get('name') === 'edit');
				const control = group.find((e) => e.get('name') === 'control');
				const info = group.find((e) => e.get('name') === 'info');
				const textButton1 = group.find(
					(e) => e.get('name') === 'text-button1'
				);
				const textButton2 = group.find(
					(e) => e.get('name') === 'text-button2'
				);
				const textButton3 = group.find(
					(e) => e.get('name') === 'text-button3'
				);
				const infoText = group.find(
					(e) => e.get('name') === 'info-text'
				);
				graph.setItemState(item, 'hover', true);
				if (evt.target.cfg.name === 'status') {
					info.cfg.visible = true;
					infoText.cfg.visible = true;
				}
				// if (box.attrs.fill === '#EBEBEB') item.enableCapture(false);
				if (pathname.includes('addBackup')) return;
				if (evt.target.cfg.name === 'rect-shape' && button1) {
					button1.cfg.visible = true;
					button2.cfg.visible = true;
					button3.cfg.visible = true;
					restart.cfg.visible = true;
					edit.cfg.visible = true;
					control.cfg.visible = true;
					textButton1.cfg.visible = true;
					textButton2.cfg.visible = true;
					textButton3.cfg.visible = true;
				}
			}
		});
		graph.on('node:mouseleave', (evt) => {
			if (!evt.target.cfg.modelId) {
				const { item } = evt;
				const group = item.getContainer();
				const button1 = group.find((e) => e.get('name') === 'button1');
				const button2 = group.find((e) => e.get('name') === 'button2');
				const button3 = group.find((e) => e.get('name') === 'button3');
				const restart = group.find((e) => e.get('name') === 'restart');
				const edit = group.find((e) => e.get('name') === 'edit');
				const control = group.find((e) => e.get('name') === 'control');
				const info = group.find((e) => e.get('name') === 'info');
				const textButton1 = group.find(
					(e) => e.get('name') === 'text-button1'
				);
				const textButton2 = group.find(
					(e) => e.get('name') === 'text-button2'
				);
				const textButton3 = group.find(
					(e) => e.get('name') === 'text-button3'
				);
				const infoText = group.find(
					(e) => e.get('name') === 'info-text'
				);
				graph.setItemState(item, 'hover', false);
				if (info) {
					info.cfg.visible = false;
					infoText.cfg.visible = false;
				}
				if (button1) {
					button1.cfg.visible = false;
					button2.cfg.visible = false;
					button3.cfg.visible = false;
					restart.cfg.visible = false;
					edit.cfg.visible = false;
					control.cfg.visible = false;
					textButton1.cfg.visible = false;
					textButton2.cfg.visible = false;
					textButton3.cfg.visible = false;
				}
			}
		});

		graph.on('node:click', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const nodes = graph.getNodes();
			const selectImage = group.find(
				(e) => e.get('name') === 'select-image'
			);
			const box = group.find((e) => e.get('name') === 'rect-shape');
			// console.log(item, evt);
			if (!setBackupObj) return;
			if (evt.target.cfg.modelId) return;
			if (serverData.type === 'mysql') {
				if (item._cfg.model.depth) {
					Message.show(
						messageConfig('warning', '提示', 'mysql只支持服务备份')
					);
					return;
				}
			}
			if (item._cfg.model.depth) {
				if (!item._cfg.model.resources.isLvmStorage) {
					Message.show(
						messageConfig(
							'warning',
							'提示',
							'存储不使用lvm时，不支持备份设置功能'
						)
					);
					return;
				}
			}
			if (box.attrs.fill === '#EBEBEB') return;
			if (!evt.target.cfg.modelId) {
				if (item._cfg.states.find((arr) => arr === 'select')) {
					setBackupObj(null);
					graph.setItemState(item, 'select', false);
					selectImage.cfg.visible = false;
					nodes.some((str) => {
						if (
							!str.hasState('select') &&
							!str.getModel().adentify &&
							!isEdit &&
							!str.getModel().hasConfigBackup
						) {
							const group = str.getContainer();
							const box = group.find(
								(data) => (data.name = 'rect-shape')
							);
							box.attr('fill', '#ffffff');
							str.enableCapture(true);
						}
					});
				} else {
					if (
						nodes.some((str) =>
							str._cfg.states.find((obj) => obj === 'select')
						)
					) {
						return;
					}
					!evt.item._cfg.model.depth
						? setBackupObj('serve')
						: setBackupObj(evt.item._cfg.model.podName);
					graph.setItemState(item, 'select', true);
					selectImage.cfg.visible = true;
					nodes.some((str) => {
						if (
							!str.hasState('select') &&
							!str.getModel().adentify &&
							!isEdit &&
							!str.getModel().hasConfigBackup
						) {
							const group = str.getContainer();
							const box = group.find(
								(data) => (data.name = 'rect-shape')
							);
							box.attr('fill', '#EBEBEB');
							str.enableCapture(false);
						}
					});
				}
			}
		});
		const handleCollapse = (e) => {
			const target = e.target;
			const id = target.get('modelId');
			const item = graph.findById(id);
			const nodeModel = item.getModel();
			nodeModel.collapsed = !nodeModel.collapsed;
			graph.layout();
			graph.setItemState(item, 'collapse', nodeModel.collapsed);
			graph.setItemState(item, 'select', false);
		};
		graph.on('collapse-text:click', (e) => {
			// console.log(e.target);
			const { item } = e;
			const group = item.getContainer();
			const collapseText = group.find(
				(e) => e.get('name') === 'collapse-text'
			);
			const text = collapseText.attr('text');
			text === '-' && collapseText.attr('text', '+');
			text === '+' && collapseText.attr('text', '-');
			graph.refreshItem(item);
			handleCollapse(e);
		});
		graph.on('collapse-back:click', (e) => {
			const { item } = e;
			const group = item.getContainer();
			const collapseText = group.find(
				(e) => e.get('name') === 'collapse-text'
			);
			const text = collapseText.attr('text');
			text === '-' && collapseText.attr('text', '+');
			text === '+' && collapseText.attr('text', '-');
			graph.refreshItem(item);
			handleCollapse(e);
		});
		graph.on('button1:click', (evt) => {
			if (!reStart) return;
			const { item } = evt;
			reStart(item.getModel());
		});
		graph.on('button2:click', (evt) => {
			if (!setEsVisible && !editConfiguration) return;
			if (serverData.type === 'elasticsearch') {
				setEsVisible();
			} else {
				editConfiguration();
			}
		});
		graph.on('button3:click', (evt) => {
			if (!openSSL) return;
			const { item } = evt;
			openSSL(item.getModel());
		});
		graph.on('text-button1:click', (evt) => {
			if (!reStart) return;
			const { item } = evt;
			reStart(item.getModel());
		});
		graph.on('text-button2:click', (evt) => {
			if (!setEsVisible && !editConfiguration) return;
			if (serverData.type === 'elasticsearch') {
				setEsVisible();
			} else {
				editConfiguration();
			}
		});
		graph.on('text-button3:click', (evt) => {
			if (!openSSL) return;
			const { item } = evt;
			openSSL(item.getModel());
		});

		window.graph = graph;
	}, []);

	const reset = () => {
		window.graph.fitCenter();
	};

	const bingger = () => {
		window.graph.zoomTo(window.graph.getZoom() * 1.1, {
			x: window.graph.getWidth() / 2,
			y: window.graph.getHeight() / 2
		});
	};

	const smaller = () => {
		window.graph.zoomTo(window.graph.getZoom() * 0.9, {
			x: window.graph.getWidth() / 2,
			y: window.graph.getHeight() / 2
		});
	};

	const scale = () => {
		if (window.graph.getWidth() !== window.innerWidth) {
			setOption({
				width: window.innerWidth,
				height: window.innerHeight,
				position: 'fixed',
				top: 0,
				left: 0,
				zIndex: 999
			});
			window.graph.changeSize(window.innerWidth, window.innerHeight);
			window.graph.fitCenter();
		} else {
			window.graph.changeSize(1180, 480);
			setOption({
				position: 'static'
			});
			window.graph.fitCenter();
		}
	};

	const changeTree = (value) => {
		window.graph.clear();

		window.graph.updateLayout({
			type: 'compactBox',
			direction: value,
			defaultNode: {
				type: 'tree-node'
			},
			defaultEdge: {
				type: 'polyline',
				style: {
					stroke: '#A3B1BF'
				}
			},
			getId: function getId(d) {
				return d.id;
			},
			getHeight: function getHeight() {
				return 100;
			},
			getWidth: function getWidth(d) {
				return d.level === 'serve' ? 60 : 220;
			},
			getVGap: function getVGap() {
				return 10;
			},
			getHGap: function getHGap(d) {
				return 20;
			}
		});
		// const edges = window.graph.getEdges();
		// edges.map(item => {
		// 	console.log(item.getSource());
		// })
		// if(value === 'TB'){
		const nodes = window.graph.getNodes();
		// nodes.map((item) => {
		// 	const group = item.getContainer();
		// 	const pods = group.find((e) => e.get('name') === 'circle');
		// 	const podTexts = group.find((e) => e.get('name') === 'circle-text');
		// 	window.graph.updateItem(item, {
		// 		anchorPoints: value === 'TB' ? [
		// 			[0.5, 1],
		// 			[1, 0.5]
		// 		] : [
		// 			[0, 0.5],
		// 			[1, 0.5]
		// 		]
		// 	});
		// 	console.log(item);
		// 	if (item.getModel().level === 'pod'){
		// 		pods.attr({
		// 			'x': 95,
		// 			'y': 0
		// 		});
		// 		podTexts.attr('x', 120);
		// 	}
		// });
		// }
		window.graph.layout();
		setDirection(value);
		window.graph.fitCenter();
	};

	return (
		<div className={styles['visualization']}>
			<h2>
				{pathname.includes('addBackup')
					? backup
						? '选择要恢复的对象'
						: '选择备份对象'
					: '关系拓扑'}
			</h2>
			<div style={{ background: '#f9f9f9', ...option }}>
				<div className={styles['tools']}>
					<Tooltip
						trigger={
							<Button onClick={scale} iconSize="xs">
								<Icon type="arrows-alt" />
							</Button>
						}
						align="b"
					>
						{window.graph &&
						window.graph.getWidth() !== window.innerWidth
							? '全屏'
							: '退出全屏'}
					</Tooltip>
					<Tooltip
						trigger={
							<Button onClick={() => changeTree('LR')}>
								<CustomIcon
									type="icon-shuxiangjiegou"
									size={12}
									style={{ color: '#000000' }}
									className={styles['rotate']}
								/>
							</Button>
						}
						align="b"
					>
						横向排列
					</Tooltip>
					<Tooltip
						trigger={
							<Button onClick={() => changeTree('TB')}>
								<CustomIcon
									type="icon-shuxiangjiegou"
									size={12}
									style={{ color: '#000000' }}
								/>
							</Button>
						}
						align="b"
					>
						竖向排列
					</Tooltip>
					<Tooltip
						trigger={
							<Button onClick={bingger}>
								<Icon type="add" />
							</Button>
						}
						align="b"
					>
						放大
					</Tooltip>
					<Tooltip
						trigger={
							<Button onClick={smaller}>
								<Icon type="minus" />
							</Button>
						}
						align="b"
					>
						缩小
					</Tooltip>
					<Tooltip
						trigger={
							<Button onClick={reset}>
								<CustomIcon
									type="icon-double-circle"
									size={12}
									style={{ color: '#000000' }}
								/>
							</Button>
						}
						align="b"
					>
						回到原点
					</Tooltip>
				</div>
				<div id="topology" style={{ ...treeOption }}></div>
				<div id="minimap"></div>
			</div>
		</div>
	);
}

export default Visualization;
