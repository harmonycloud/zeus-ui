import React, { useState, useEffect } from 'react';
import styles from './esEdit.module.scss';
import G6 from '@antv/g6';
import { Button, Icon } from '@alicloud/console-components';
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
		title: '未准备好'
	},
	{
		status: 'Creating',
		color: '#1E8E3E',
		image: Completed,
		title: '启动中'
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
	null: ''
};

function Visualization(props) {
	const { topoData, serverData, setBackupObj, isEdit, openSSL, reStart, editConfiguration, setEsVisible, backupType } = props;
	const location = useLocation();
	const { pathname } = location;
	// console.log(serverData.type);

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

	const isSelect = () => {
		return backupType === 'Cluser' ? true : false
	}

	useEffect(() => {
		let url = window.location.href.split('/');
		let imagePath =
			url[url.length - 2] + '-' + url[url.length - 1] + '.svg';

		G6.registerNode(
			'tree-node',
			{
				drawShape: function drawShape(cfg, group) {
					// console.log(cfg, serverData, group);
					const box = group.addShape('rect', {
						attrs: {
							fill: '#fff',
							// fill: isSelect && !cfg.depth ? '#fff' : '#EBEBEB',
							stroke: '#666',
							x: 0,
							y: 0,
							width: 228,
							height: 100,
							// opacity: isSelect && !cfg.depth ? 1 : 0.6
						},
						name: 'rect-shape',
					});
					const boxWidth = box.getBBox().width;
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
										item.status === serverData.status
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
										item.status === serverData.status
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
							y: 30,
							textBaseline: 'middle',
							fill: '#333',
							fontWeight: 500,
							lineHeight: 18,
							fontFamily: 'PingFangSC-Medium, PingFang SC'
						},
						name: 'text-shape1',
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
							name: 'text-shape3',

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
								'G' + '/' +
								(cfg.resources.storageClassQuota ? cfg.resources.storageClassQuota : ''),
							x: 45,
							y: !cfg.depth ? 55 : 70,
							textBaseline: 'middle',
							fill: '#666',
							fontWeight: 400
						},
						name: 'text-shape2',
					});
					group.addShape('image', {
						attrs: {
							img: `${api}/images/middleware/${imagePath}`,
							x: 130,
							y: 34,
							width: 32,
							height: 32
						},
						visible: !cfg.depth,
						name: 'status-image',
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
						name: 'right',
					});
					group.addShape('text', {
						attrs: {
							text: '已',
							x: 212,
							y: 42,
							fill: '#fff'
						},
						visible: hasConfigBackup(cfg),
						name: 'text1',
					});
					group.addShape('text', {
						attrs: {
							text: '设',
							x: 212,
							y: 54,
							fill: '#fff'
						},
						visible: hasConfigBackup(cfg),
						name: 'text2',
					});
					group.addShape('text', {
						attrs: {
							text: '置',
							x: 212,
							y: 66,
							fill: '#fff',

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
						visible: false,
						name: 'select-image'
					});
					const hasChildren = cfg.children && cfg.children.length > 0;
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
							name: 'restart',
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
								cursor: 'pointer',
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
							name: 'edit',
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
							name: 'control',
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
					// 服务模式
					if (hasChildren && !cfg.depth) {
						group.addShape('text', {
							attrs: {
								text:
									serverData.type !== 'redis'
										? modelMap[serverData.mode]
										: serverData.mode === 'sentinel'
											? '哨兵'
											: serverData.quota.redis.num === 6
												? '三主三从'
												: '五主五从' || '',
								fill: 'rgba(0, 0, 0, .65)',
								x: boxWidth + 35,
								y: 44,
								fontSize: 10,
								width: 12,
								textAlign: 'center',
								cursor: 'pointer'
							},
							name: 'serve',
							visible: true,
							modelId: cfg.id
						});
						group.addShape('rect', {
							attrs: {
								stroke: '#A3B1BF',
								x: 229,
								y: 50,
								width: 70,
								height: 0,
							},
							name: 'line',
						});
					}
					// 实例模式
					if (!hasChildren && cfg.depth) {
						group.addShape('text', {
							attrs: {
								text: roleRender(cfg.role, '', cfg),
								fill: 'rgba(0, 0, 0, .65)',
								x: -40,
								y: 44,
								fontSize: 10,
								width: 12,
								textAlign: 'center',
								cursor: 'pointer'
							},
							name: 'pod'
						});
					}
					if (cfg.children && cfg.children.length) {
						group.addShape('rect', {
							attrs: {
								x: boxWidth + 60,
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
								x: boxWidth + 68,
								y: 48,
								textAlign: 'center',
								textBaseline: 'middle',
								text: '+',
								fontSize: 16,
								cursor: 'pointer',
								fill: 'rgba(0, 0, 0, 0.25)'
							},
							name: 'collapse-text',
							modelId: cfg.id
						});
					}
					return box;
				}
			},
			'single-node'
		);

		G6.registerEdge('polyline', {
			draw(cfg, group) {
				const startPoint = cfg.startPoint;
				const endPoint = cfg.endPoint;

				const { style } = cfg;
				// console.log(startPoint, endPoint);
				const shape = group.addShape('path', {
					attrs: {
						stroke: style.stroke,
						path: [
							['M', startPoint.x, startPoint.y],
							[
								'L',
								endPoint.x / 2 + (2 / 3) * startPoint.x,
								startPoint.y
							], // 二分之一处
							[
								'L',
								endPoint.x / 2 + (2 / 3) * startPoint.x,
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
				default: [
					'drag-canvas',
					'zoom-canvas'
				]
			},
			nodeStateStyles: {
				hover: {
					fill: '#fff',
					// opacity: 0.7
				},
				select: {
					stroke: '#0064C8',
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
				getWidth: function getWidth() {
					return 220;
				},
				getVGap: function getVGap() {
					return 20;
				},
				getHGap: function getHGap() {
					return 80;
				}
			}
		});
		let res = {
			id: 'tree'
		};
		topoData.pods
			? (res.children = topoData.pods)
			: (res.children = [].concat(...topoData.listChildGroup.map((item) => item.pods)));
		graph.data(res);
		graph.render();
		graph.fitCenter();
		graph.on('node:mouseenter', (evt) => {
			if (pathname.includes('addBackup')) return;
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
			const infoText = group.find((e) => e.get('name') === 'info-text');
			graph.setItemState(item, 'hover', true);
			if (evt.target.cfg.name === 'status') {
				info.cfg.visible = true;
				infoText.cfg.visible = true;
			}
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
		});
		graph.on('node:mouseleave', (evt) => {
			if (pathname.includes('addBackup')) return;
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
			const infoText = group.find((e) => e.get('name') === 'info-text');
			graph.setItemState(item, 'hover', false);
			info.cfg.visible = false;
			infoText.cfg.visible = false;
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
		});

		graph.on('node:click', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const nodes = graph.getNodes();;
			const selectImage = group.find(
				(e) => e.get('name') === 'select-image'
			);
			console.log(item, evt);
			if (!setBackupObj) return;
			if (serverData.type === 'mysql') {
				if (item._cfg.model.depth) {
					Message.show(
						messageConfig(
							'warning',
							'提示',
							'mysql只支持服务备份'
						)
					);
					return;
				}
			}
			if (!evt.target.cfg.modelId) {
				if (item._cfg.states.find(arr => arr === 'select')) {
					setBackupObj(null)
					graph.setItemState(item, 'select', false);
					selectImage.cfg.visible = false;
				} else {
					if (nodes.some(str => str._cfg.states.find(obj => obj === 'select'))) {
						nodes.map(obj => {
							// graph.setItemState(obj, 'select', true);
							const x = obj.getContainer();
							const y = x.find(
								(e) => e.get('name') === 'select-image'
							);
							y.cfg.visible = true;
						})
						// const group = item.getContainer();
						// const box = group.find((e) => e.get('name') === 'rect-shape');
						// graph.updateItem(item, {
						// 	style: {
						// 		fill: 'red'
						// 	}
						// });
						return;
					}
					!evt.item._cfg.model.depth ? setBackupObj('serve') : setBackupObj(evt.item._cfg.model.podName);
					graph.setItemState(item, 'select', true);
					selectImage.cfg.visible = true;
				}
			}
		});
		// graph.on('button1:mouseenter', (evt) => {
		//     const { item } = evt;
		//     const group = item.getContainer();
		//     const button1 = group.find((e) => e.get('name') === 'button1');
		//     button1.attrs.fill = '#000';
		// })
		// graph.on('button1:mouseleave', (evt) => {
		//     const { item } = evt;
		//     const group = item.getContainer();
		//     const button1 = group.find((e) => e.get('name') === 'button1');
		//     button1.attrs.fill = '#595959';
		// })
		// graph.on('button2:mouseenter', (evt) => {
		//     const { item } = evt;
		//     const group = item.getContainer();
		//     const button2 = group.find((e) => e.get('name') === 'button2');
		//     button2.attrs.fill = '#000';
		// })
		// graph.on('button2:mouseleave', (evt) => {
		//     const { item } = evt;
		//     const group = item.getContainer();
		//     const button2 = group.find((e) => e.get('name') === 'button2');
		//     button2.attrs.fill = '#595959';
		// })
		// graph.on('button3:mouseenter', (evt) => {
		//     const { item } = evt;
		//     const group = item.getContainer();
		//     const button3 = group.find((e) => e.get('name') === 'button3');
		//     button3.attrs.fill = '#000';
		// })
		// graph.on('button3:mouseleave', (evt) => {
		//     const { item } = evt;
		//     const group = item.getContainer();
		//     const button3 = group.find((e) => e.get('name') === 'button3');
		//     button3.attrs.fill = '#595959';
		// })
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
			console.log(e.target);
			const { item } = e;
			const group = item.getContainer();
			const collapseText = group.find(
				(e) => e.get('name') === 'collapse-text'
			);
			const serve = group.find((e) => e.get('name') === 'serve');
			const text = collapseText.cfg.attrs.text;
			text === '-'
				? (collapseText.attrs.text = '+')
				: (collapseText.attrs.text = '-');
			text === '-'
				? (serve.cfg.visible = false)
				: (serve.cfg.visible = true);
			handleCollapse(e);
		});
		graph.on('collapse-back:click', (e) => {
			const { item } = e;
			const group = item.getContainer();
			const collapseText = group.find(
				(e) => e.get('name') === 'collapse-text'
			);
			const serve = group.find((e) => e.get('name') === 'serve');
			const text = collapseText.cfg.attrs.text;
			text === '-'
				? (collapseText.attrs.text = '+')
				: (collapseText.attrs.text = '-');
			text === '-'
				? (serve.cfg.visible = false)
				: (serve.cfg.visible = true);
			handleCollapse(e);
		});
		graph.on('button1:click', (evt) => {
			if (!reStart) return;
			const { item } = evt;
			reStart(item.getModel())
		});
		graph.on('button2:click', (evt) => {
			if (!setEsVisible && !editConfiguration) return;
			console.log(111);
			if (serverData.type === 'elasticsearch') {
				setEsVisible()
			} else {
				editConfiguration()
			}
		});
		graph.on('button3:click', (evt) => {
			if (!openSSL) return;
			const { item } = evt;
			openSSL(item.getModel())
		});
		graph.on('text-button1:click', (evt) => {
			if (!reStart) return;
			const { item } = evt;
			reStart(item.getModel())
		});
		graph.on('text-button2:click', (evt) => {
			if (!setEsVisible && !editConfiguration) return;
			if (serverData.type === 'elasticsearch') {
				setEsVisible()
			} else {
				editConfiguration()
			}
		});
		graph.on('text-button3:click', (evt) => {
			if (!openSSL) return;
			const { item } = evt;
			openSSL(item.getModel())
		});

		window.graph = graph;
	}, []);

	const reset = () => {
		window.graph.fitCenter();
	};

	const bingger = () => {
		window.graph.zoom(window.graph.getZoom() * 1.2);
	};

	const smaller = () => {
		window.graph.zoom(window.graph.getZoom() * 0.8);
	};

	const changeTree = (value) => {
		window.graph.updateLayout({
			type: 'compactBox',
			direction: value,
			defaultNode: {
				type: 'tree-node',
				anchorPoints:
					value === 'TB'
						? [
							[0.5, 0],
							[0.5, 1]
						]
						: [
							[0, 0.5],
							[1, 0.5]
						]
			},
			getId: function getId(d) {
				return d.id;
			},
			getHeight: function getHeight() {
				return 100;
			},
			getWidth: function getWidth() {
				return 220;
			},
			getVGap: function getVGap() {
				return 30;
			},
			getHGap: function getHGap() {
				return 80;
			}
		});
	};

	return (
		<div className={styles['visualization']}>
			<h2>{pathname.includes('addBackup') ? isEdit ? '选择要恢复的对象' : '选择备份对象' : '关系拓扑'}</h2>
			<div className={styles['tools']}>
				<Button>
					<Icon type="arrows-alt" />
				</Button>
				<Button>
					<Icon
						type="Directory-tree"
						onClick={() => changeTree('LR')}
					/>
				</Button>
				<Button>
					<CustomIcon
						type="icon-shuxiangjiegou"
						size={12}
						style={{ color: '#000000' }}
						onClick={() => changeTree('TB')}
					/>
				</Button>
				<Button>
					<Icon type="add" onClick={bingger} />
				</Button>
				<Button>
					<Icon type="minus" onClick={smaller} />
				</Button>
				<Button>
					<CustomIcon
						type="icon-double-circle"
						size={12}
						style={{ color: '#000000' }}
						onClick={reset}
					/>
				</Button>
			</div>
			<div
				id="topology"
				style={{ background: '#f9f9f9' }}
			></div>
			<div
				id="minimap"
				style={{ background: '#f9f9f9' }}
			></div>
		</div>
	);
}

export default Visualization;
