import React, { useState, useEffect } from 'react';
import styles from './esEdit.module.scss';
import G6 from '@antv/g6';
import { useParams } from 'react-router';
import { Button, Icon, Balloon } from '@alicloud/console-components';
import CustomIcon from '@/components/CustomIcon';
import { api } from '@/api.json';
import Restart from '@/assets/images/restart.svg';
import RestartHover from '@/assets/images/restart_hover.svg';
import Edit from '@/assets/images/edit.svg';
import EditHover from '@/assets/images/edit_hover.svg';
import Control from '@/assets/images/control.svg';
import ControlHover from '@/assets/images/control_hover.svg';
import { useLocation } from 'react-router';
import { Message } from '@alicloud/console-components';
import messageConfig from '@/components/messageConfig';
import { initMenu, modelMap } from '@/utils/const';
import { states, podStatus } from '@/utils/const';
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
	top: 0 !important;
	height: 90% !important;
}
.g6-minimap{
	position: absolute;
	top: 40px;
	right: 0;
	background: #f9f9f9
}
`);

const { Tooltip } = Balloon;

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
		backup
	} = props;
	const location = useLocation();
	const { pathname } = location;
	const { type, chartVersion } = useParams();
	const [option, setOption] = useState();
	const [direction, setDirection] = useState('LR');

	const roleRender = (value, index, record) => {
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
			return true;
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

	const circleX = (direction, cfg) => {
		if (direction === 'LR') {
			return cfg.level === 'pod' ? 30 : 0;
		} else {
			return cfg.level === 'pod' ? 108 : 0;
		}
	};

	const circleTextX = (direction, cfg) => {
		if (direction === 'LR') {
			return cfg.level === 'pod' ? 60 : 30;
		} else {
			return cfg.level === 'pod' ? 138 : 30;
		}
	};

	const circleTextY = (direction, cfg) => {
		if (direction === 'LR') {
			return cfg.level === 'serve' && cfg.adentify.length >= 6 ? 87 : 88;
		} else {
			return 13;
		}
	};

	const collapseBackX = (direction, cfg) => {
		if (direction === 'LR') {
			return cfg.level === 'serve' ? 87 : 195;
		} else {
			return cfg.level === 'serve' ? 23 : 131;
		}
	};

	const collapseTextX = (direction, cfg) => {
		if (direction === 'LR') {
			return cfg.level === 'serve' ? 95 : 203;
		} else {
			return cfg.level === 'serve' ? 31 : 139;
		}
	};

	const createTopo = (direction) => {
		window.graph && window.graph.clear();
		window.graph && window.graph.destroy();

		let imagePath = type + '-' + chartVersion + '.svg';

		G6.registerNode(
			'tree-node',
			{
				drawShape: function drawShape(cfg, group) {
					if (cfg.adentify) {
						const circle = group.addShape('rect', {
							attrs: {
								stroke: '#666',
								fill: '#fff',
								width: 60,
								height: 20,
								radius: 10,
								y: direction === 'LR' ? 75 : 0,
								x: circleX(direction, cfg),
								cursor: 'pointer'
							},
							name: 'circle'
						});
						group.addShape('text', {
							attrs: {
								text:
									cfg.level === 'serve'
										? cfg.adentify
										: roleRender(cfg.adentify, '', cfg),
								fill: 'rgb(0, 0, 0)',
								fontSize:
									cfg.level === 'serve' &&
									cfg.adentify.length >= 6
										? 6
										: 8,
								textAlign: 'center',
								width: 60,
								height: 30,
								x: circleTextX(direction, cfg),
								y: circleTextY(direction, cfg)
							},
							name: 'circle-text'
						});
						if (cfg.children && cfg.children.length) {
							group.addShape('rect', {
								attrs: {
									x: collapseBackX(direction, cfg),
									y: direction === 'LR' ? 76 : 108,
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
									x: collapseTextX(direction, cfg),
									y:
										direction === 'LR'
											? /macintosh|mac os x/i.test(
													navigator.userAgent
											  )
												? 82
												: 84
											: /macintosh|mac os x/i.test(
													navigator.userAgent
											  )
											? 114
											: 116,
									textAlign: 'center',
									textBaseline: 'middle',
									text: cfg.collapsed ? '+' : '-',
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
								stroke: '#eee',
								x: 0,
								y: 0,
								width: 276,
								height: 170,
								opacity: isSelect(cfg) ? 1 : 0.6
							},
							name: 'rect-shape'
						});
						if (!cfg.depth) {
							const type = group.addShape('image', {
								attrs: {
									img: `${api}/images/middleware/${imagePath}`,
									x: 16,
									y: 5,
									width: 20,
									height: 20
								},
								name: 'type-image'
							});
							const typeWidth = type.getBBox().width;
							const name = group.addShape('text', {
								attrs: {
									text:
										cfg.name && cfg.name.length >= 8
											? '名称：' +
											  cfg.name.substring(0, 8) +
											  '...'
											: '名称：' + cfg.name,
									x: typeWidth + 24,
									y: 16,
									textBaseline: 'middle',
									fill: '#0070cc',
									fontSize: 14,
									fontWeight: 500,
									fontFamily: 'PingFangSC-Medium, PingFang SC'
								},
								name: 'name'
							});
							const nameWidth = name.getBBox().width;
							const serviceStatus = states.find(
								(item) => item.value === cfg.status
							);
							group.addShape('text', {
								attrs: {
									text: serviceStatus
										? '(' + serviceStatus.label + ')'
										: '(运行异常)',
									x: typeWidth + nameWidth + 32,
									y: 15,
									fontSize: 14,
									fontWeight: 500,
									textBaseline: 'middle',
									fill: serviceStatus
										? serviceStatus.color
										: '#DA372E'
								},
								name: 'status'
							});
							group.addShape('text', {
								attrs: {
									text:
										cfg.aliasName &&
										cfg.aliasName.length >= 15
											? '中文别名：' +
											  cfg.aliasName.substring(0, 13) +
											  '...'
											: '中文别名：' + cfg.aliasName,
									x: 16,
									y: 37,
									textBaseline: 'middle',
									fill: '#999',
									fontFamily: 'PingFangSC-Medium, PingFang SC'
								},
								name: 'aliasName'
							});
						} else {
							const ip = group.addShape('text', {
								attrs: {
									text: 'IP: ' + (cfg.podIp ? cfg.podIp : '--'),
									x: 16,
									y: 15,
									textBaseline: 'middle',
									fill: '#000',
									fontSize: 14,
									fontWeight: 500,
									fontFamily: 'PingFangSC-Medium, PingFang SC'
								},
								name: 'text-shape1'
							});
							const ipWidth = ip.getBBox().width;
							group.addShape('text', {
								attrs: {
									text:
										podStatus.filter(
											(item) => item.value === cfg.status
										)[0] &&
										'(' +
											podStatus.filter(
												(item) =>
													item.value === cfg.status
											)[0].label +
											')',
									x: ipWidth + 24,
									y: 15,
									fontSize: 14,
									fontWeight: 500,
									textBaseline: 'middle',
									fill:
										podStatus.filter(
											(item) => item.value === cfg.status
										)[0] &&
										podStatus.filter(
											(item) => item.value === cfg.status
										)[0].color
								},
								name: 'status'
							});
							group.addShape('text', {
								attrs: {
									text:
										cfg.podName && cfg.podName.length >= 25
											? '名称：' +
											  cfg.podName.substring(0, 15) +
											  '...' +
											  cfg.podName.substring(
													cfg.podName.length - 6,
													cfg.podName.length
											  )
											: '名称：' + cfg.podName,
									x: 16,
									y: 37,
									textBaseline: 'middle',
									fill: '#999'
								},
								name: 'podName'
							});
							group.addShape('text', {
								attrs: {
									text:
										'节点资源/存储: ' +
										cfg?.resources?.cpu +
										'C/' +
										cfg?.resources?.memory +
										'G' +
										'/' +
										(cfg?.resources?.storageClassQuota
											? cfg?.resources?.storageClassQuota
											: ''),
									x: 16,
									y: 71,
									fill: '#999'
								},
								name: 'text-shape2'
							});
						}
						group.addShape('text', {
							attrs: {
								text: `存储类型：${
									cfg.depth
										? cfg.resources.isLvmStorage
											? 'LVM'
											: '其他'
										: cfg.storageClassName
								}`,
								x: 16,
								y: 57,
								fill: '#999'
							},
							name: 'text-shape3'
						});
						group.addShape('text', {
							attrs: {
								text: '...',
								x: 248,
								y: 10,
								fontSize: 16,
								fontWeight: 900,
								textBaseline: 'middle',
								fill: '#666',
								cursor: 'pointer'
							},
							name: 'more'
						});
						group.addShape('polygon', {
							attrs: {
								points: [
									[276, 144],
									[276, 170],
									[250, 170]
								],
								fill: '#6236FF',
								opacity: 0.6
							},
							visible: hasConfigBackup(cfg),
							name: 'right'
						});
						group.addShape('text', {
							attrs: {
								text: '备',
								x: 264,
								y: 166,
								fontSize: 10,
								fill: '#fff'
							},
							visible: hasConfigBackup(cfg),
							name: 'bei'
						});
						group.addShape('rect', {
							attrs: {
								width: 244,
								height: 76,
								x: 16,
								y: 80,
								fill: '#efefef',
								fillOpacity: 0.7
							},
							name: 'percent'
						});
						const storageUsage = Math.round(
							cfg?.monitorResourceQuota?.storage?.usage
						);
						group.addShape('text', {
							attrs: {
								text: '存储',
								x: 24,
								y: 97,
								fontSize: 10,
								textBaseline: 'middle',
								fill: '#333'
							},
							name: 'storage-info'
						});
						group.addShape('rect', {
							attrs: {
								width: 150,
								height: 10,
								x: 50,
								y: 92,
								radius: 5,
								fill: '#ddd',
								fillOpacity: 0.7
							},
							name: 'storage-box'
						});
						group.addShape('rect', {
							attrs: {
								width:
									storageUsage < 100
										? storageUsage * 1.5
										: 150,
								height: 10,
								x: 50,
								y: 92,
								radius: storageUsage > 0 ? 5 : 0,
								fill:
									storageUsage < 50
										? '#0064C8'
										: storageUsage < 80
										? '#FAC800'
										: '#C80000'
							},
							name: 'storage'
						});
						group.addShape('text', {
							attrs: {
								text:
									storageUsage < 100
										? storageUsage + '%'
										: '100%',
								x: 210,
								y: 97,
								fontSize: 10,
								textBaseline: 'middle',
								fill: '#333'
							},
							name: 'storage-text'
						});
						const cpuUsage = Math.round(
							cfg?.monitorResourceQuota?.cpu?.usage
						);
						group.addShape('text', {
							attrs: {
								text: 'CPU',
								x: 24,
								y: 117,
								fontSize: 10,
								textBaseline: 'middle',
								fill: '#333'
							},
							name: 'cpu-info'
						});
						group.addShape('rect', {
							attrs: {
								width: 150,
								height: 10,
								x: 50,
								y: 112,
								radius: 5,
								fill: '#ddd',
								fillOpacity: 0.7
							},
							name: 'cpu-box'
						});
						group.addShape('rect', {
							attrs: {
								width: cpuUsage < 100 ? cpuUsage * 1.5 : 150,
								height: 10,
								x: 50,
								y: 112,
								radius: cpuUsage > 0 ? 5 : 0,
								fill:
									cpuUsage < 50
										? '#0064C8'
										: cpuUsage < 80
										? '#FAC800'
										: '#C80000'
							},
							name: 'cpu'
						});
						group.addShape('text', {
							attrs: {
								text: cpuUsage < 100 ? cpuUsage + '%' : '100%',
								x: 210,
								y: 117,
								fontSize: 10,
								textBaseline: 'middle',
								fill: '#333'
							},
							name: 'cpu-text'
						});
						const memoryUsage = Math.round(
							cfg?.monitorResourceQuota?.memory?.usage
						);
						group.addShape('text', {
							attrs: {
								text: '内存',
								x: 24,
								y: 137,
								fontSize: 10,
								textBaseline: 'middle',
								fill: '#333'
							},
							name: 'memory-info'
						});
						group.addShape('rect', {
							attrs: {
								width: 150,
								height: 10,
								x: 50,
								y: 132,
								radius: 5,
								fill: '#ddd',
								fillOpacity: 0.7
							},
							name: 'memory-box'
						});
						group.addShape('rect', {
							attrs: {
								width:
									memoryUsage < 100 ? memoryUsage * 1.5 : 150,
								height: 10,
								x: 50,
								y: 132,
								radius: memoryUsage > 0 ? 5 : 0,
								fill:
									memoryUsage < 50
										? '#0064C8'
										: memoryUsage < 80
										? '#FAC800'
										: '#C80000'
							},
							name: 'memory'
						});
						group.addShape('text', {
							attrs: {
								text:
									memoryUsage < 100
										? memoryUsage + '%'
										: '100%',
								x: 210,
								y: 137,
								fontSize: 10,
								textBaseline: 'middle',
								fill: '#333'
							},
							name: 'memory-text'
						});
						group.addShape('rect', {
							attrs: {
								x: 184,
								y: 30,
								width: 92,
								height: !cfg.depth ? 50 : 84,
								stroke: '#C0C6CC',
								cursor: 'pointer',
								fill: '#fff',
								cursor: 'pointer'
							},
							visible: false,
							name: 'button'
						});
						const hasChildren =
							cfg.children && cfg.children.length > 0;
						if (!cfg.depth) {
							group.addShape('rect', {
								attrs: {
									x: 185,
									y: 38,
									width: 89,
									height: 34,
									cursor: 'pointer',
									fill: '#fff'
								},
								visible: false,
								name: 'button2'
							});
							group.addShape('image', {
								attrs: {
									img: Edit,
									x: 192,
									y: 50,
									width: 12,
									height: 12
								},
								visible: false,
								name: 'edit'
							});
							group.addShape('text', {
								attrs: {
									text: '修改规格',
									x: 230,
									y: 55,
									textAlign: 'center',
									textBaseline: 'middle',
									fill: '#999',
									cursor: 'pointer'
								},
								visible: false,
								name: 'text-button2'
							});
						}
						if (!hasChildren && cfg.depth) {
							group.addShape('rect', {
								attrs: {
									x: 185,
									y: 72,
									width: 89,
									height: 34,
									fill: '#fff',
									cursor: 'pointer'
								},
								name: 'button1',
								visible: false
							});
							group.addShape('image', {
								attrs: {
									img: Restart,
									x: 192,
									y: 83,
									width: 12,
									height: 12
								},
								name: 'restart',
								visible: false
							});
							group.addShape('text', {
								attrs: {
									text: '重启',
									x: 220,
									y: 89,
									textAlign: 'center',
									textBaseline: 'middle',
									fill: '#999',
									cursor: 'pointer'
								},
								name: 'text-button1',
								visible: false
							});
							group.addShape('rect', {
								attrs: {
									x: 185,
									y: 38,
									width: 89,
									height: 34,
									cursor: 'pointer',
									fill: '#fff'
								},
								visible: false,
								name: 'button3'
							});
							group.addShape('image', {
								attrs: {
									img: Control,
									x: 192,
									y: 50,
									width: 12,
									height: 12
								},
								visible: false,
								name: 'control'
							});
							group.addShape('text', {
								attrs: {
									text: '控制台',
									x: 225,
									y: 55,
									textAlign: 'center',
									textBaseline: 'middle',
									fill: '#999',
									cursor: 'pointer'
								},
								name: 'text-button3',
								visible: false
							});
						}
						const breath = Math.max(
							storageUsage,
							cpuUsage,
							memoryUsage
						);
						group.addShape('rect', {
							attrs: {
								x: 0,
								y: 0,
								width: 276,
								height: 2,
								fill:
									breath < 50
										? '#0064C8'
										: breath < 80
										? '#FAC800'
										: '#C80000',
								cursor: 'pointer'
							},
							name: 'breath'
						});
						// group.addShape('rect', {
						// 	attrs: {
						// 		width: 420,
						// 		height: 30,
						// 		x: -90,
						// 		y: -40,
						// 		stroke: '#aaa',
						// 		fill: '#fff',
						// 		cursor: 'pointer'
						// 	},
						// 	name: 'breath-box',
						// 	visible: false
						// });
						// group.addShape('text', {
						// 	attrs: {
						// 		text: '当存储、CPU、内存任何一个指标使用率过高时，都将爆红，请您重点关注',
						// 		x: 120,
						// 		y: -25,
						// 		textAlign: 'center',
						// 		textBaseline: 'middle',
						// 		fill: '#000',
						// 		cursor: 'pointer'
						// 	},
						// 	name: 'breath-text',
						// 	visible: false
						// });
						// group.addShape('polygon', {
						// 	attrs: {
						// 		points: [
						// 			[130, 0],
						// 			[120, -10],
						// 			[140, -10]
						// 		],
						// 		fill: '#fff',
						// 		stroke: '#aaa'
						// 	},
						// 	name: 'breath-info'
						// });
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
											startPoint.x,
											endPoint.y / 2 +
												(1 / 2) * startPoint.y
										], // 二分之一处
										[
											'L',
											endPoint.x,
											endPoint.y / 2 +
												(1 / 2) * startPoint.y
										], // 二分之二处
										['L', endPoint.x, endPoint.y]
								  ]
					},
					name: 'path'
				});

				return shape;
			}
		});

		const topology = document.getElementById('topology');
		const minimapDom = document.getElementById('minimap');
		const tooltip = new G6.Tooltip({
			offsetX: -70,
			offsetY: -185,
			getContent(e) {
				const outDiv = document.createElement('div');
				const memoryUsage = Math.round(
					e.item.getModel()?.monitorResourceQuota?.memory?.usage
				);
				const cpuUsage = Math.round(
					e.item.getModel()?.monitorResourceQuota?.cpu?.usage
				);
				const storageUsage = Math.round(
					e.item.getModel()?.monitorResourceQuota?.storage?.usage
				);
				const max = Math.max(memoryUsage, cpuUsage, storageUsage);
				outDiv.style.width = '300px';
				outDiv.innerHTML = `<h4 style={text-align: 'center'}>${
					max < 50
						? '当前存储、CPU、内存任何一个指标使用率都＜50%，可放心使用'
						: max < 80
						? '当存储、CPU、内存任何一个指标使用率已经处于≥50%但＜80%内，将展示黄色，请关注'
						: '当存储、CPU、内存任何一个指标使用率≥80%时，都将爆红，请您重点关注，或采取必要措施'
				}</h4>`;
				return outDiv;
			},
			itemTypes: ['node'],
			// fixToNode: [0,0],
			shouldBegin: (evt) => evt.target.cfg.name === 'breath'
		});
		const width = topology.scrollWidth || 800;
		const height = topology.scrollHeight || 480;
		const minimap = new G6.Minimap({
			container: minimapDom,
			size: [110, 80],
			viewportClassName: 'mini-view'
		});
		const graph = new G6.TreeGraph({
			container: 'topology',
			width,
			height,
			fitViewPadding: [20, 30, 20, 30],
			plugins: [minimap, tooltip],
			modes: {
				default: ['drag-canvas', 'zoom-canvas']
			},
			nodeStateStyles: {
				hover: {
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
				direction,
				getId: function getId(d) {
					return d.id;
				},
				getHeight: function getHeight() {
					return 190;
				},
				getWidth: function getWidth(d) {
					return d.level === 'serve' ? 60 : 276;
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
			status: topoData.status,
			aliasName: topoData.aliasName,
			monitorResourceQuota: topoData.monitorResourceQuota,
			storageClassName: topoData.storageClassName,
			children: [
				{
					adentify: serveRender() || '未知',
					level: 'serve',
					children: pods
				}
			]
		};
		graph.data(res);
		graph.render();
		(topoData.pods.length && topoData.pods.length >= 4) ||
		direction === 'TB'
			? graph.fitView()
			: graph.fitCenter();

		const nodes = graph.getNodes();
		nodes.map((item) => {
			graph.updateItem(item, {
				anchorPoints:
					direction === 'TB'
						? [
								[0.5, 1],
								[0.5, 0]
						  ]
						: [
								[0, 0.5],
								[1, 0.5]
						  ]
			});
		});

		graph.on('node:click', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const nodes = graph.getNodes();
			const box = group.find((e) => e.get('name') === 'rect-shape');
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
			const { item } = e;
			const group = item.getContainer();
			const collapseText = group.find(
				(e) => e.get('name') === 'collapse-text'
			);
			const collapseBack = group.find(
				(e) => e.get('name') === 'collapse-back'
			);
			const nodes = graph.getNodes();
			const text = collapseText.attr('text');
			console.log(item.getModel().children);
			if (text === '-') {
				if (direction === 'LR') {
					collapseBack.attr(
						'x',
						item.getModel().depth === 1 ? 60 : 90
					);
					collapseText.attr({
						text: '+',
						x: item.getModel().depth === 1 ? 68 : 98
					});
				} else {
					collapseBack.attr('y', 20);
					collapseText.attr({
						text: '+',
						y: /macintosh|mac os x/i.test(navigator.userAgent)
							? 26
							: 28
					});
				}
				nodes.map((i) => {
					if (item.getModel().depth === 1 && i.getModel().depth > 1) {
						graph.hideItem(i);
					}
				});
			} else {
				if (direction === 'LR') {
					collapseBack.attr(
						'x',
						item.getModel().depth === 1 ? 87 : 195
					);
					collapseText.attr({
						text: '-',
						x: item.getModel().depth === 1 ? 95 : 203
					});
				} else {
					collapseBack.attr('y', 108);
					collapseText.attr({
						text: '-',
						y: /macintosh|mac os x/i.test(navigator.userAgent)
							? 114
							: 116
					});
				}
				nodes.map((i) => {
					if (item.getModel().depth === 1 && i.getModel().depth > 1) {
						graph.showItem(i);
					}
				});
			}
			item.refresh();
			item.getModel().depth === 2 && handleCollapse(e);
		});
		graph.on('collapse-back:click', (e) => {
			const { item } = e;
			const group = item.getContainer();
			const collapseText = group.find(
				(e) => e.get('name') === 'collapse-text'
			);
			const collapseBack = group.find(
				(e) => e.get('name') === 'collapse-back'
			);
			const text = collapseText.attr('text');
			if (text === '-') {
				if (direction === 'LR') {
					collapseBack.attr(
						'x',
						item.getModel().depth === 1 ? 60 : 90
					);
					collapseText.attr({
						text: '+',
						x: item.getModel().depth === 1 ? 68 : 98
					});
				} else {
					collapseBack.attr('y', 20);
					collapseText.attr({
						text: '+',
						y: /macintosh|mac os x/i.test(navigator.userAgent)
							? 26
							: 28
					});
				}
				nodes.map((i) => {
					if (item.getModel().depth === 1 && i.getModel().depth > 1) {
						graph.hideItem(i);
					}
				});
			} else {
				if (direction === 'LR') {
					collapseBack.attr(
						'x',
						item.getModel().depth === 1 ? 87 : 195
					);
					collapseText.attr({
						text: '-',
						x: item.getModel().depth === 1 ? 95 : 203
					});
				} else {
					collapseBack.attr('y', 62);
					collapseText.attr({
						text: '-',
						y: /macintosh|mac os x/i.test(navigator.userAgent)
							? 69
							: 71
					});
				}
				nodes.map((i) => {
					if (item.getModel().depth === 1 && i.getModel().depth > 1) {
						graph.showItem(i);
					}
				});
			}
			graph.refreshItem(item);
			item.getModel().depth === 2 && handleCollapse(e);
		});

		graph.on('more:click', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const button = group.find((e) => e.get('name') === 'button');
			const button1 = group.find((e) => e.get('name') === 'button1');
			const button2 = group.find((e) => e.get('name') === 'button2');
			const button3 = group.find((e) => e.get('name') === 'button3');
			const restart = group.find((e) => e.get('name') === 'restart');
			const edit = group.find((e) => e.get('name') === 'edit');
			const control = group.find((e) => e.get('name') === 'control');
			const textButton1 = group.find(
				(e) => e.get('name') === 'text-button1'
			);
			const textButton2 = group.find(
				(e) => e.get('name') === 'text-button2'
			);
			const textButton3 = group.find(
				(e) => e.get('name') === 'text-button3'
			);
			if (setBackupObj) return;
			if (button1 && button3) {
				button.cfg.visible = !button.cfg.visible;
				button1.cfg.visible = !button1.cfg.visible;
				button3.cfg.visible = !button3.cfg.visible;
				restart.cfg.visible = !restart.cfg.visible;
				control.cfg.visible = !control.cfg.visible;
				textButton1.cfg.visible = !textButton1.cfg.visible;
				textButton3.cfg.visible = !textButton3.cfg.visible;
			}
			if (button2) {
				button.cfg.visible = !button.cfg.visible;
				button2.cfg.visible = !button2.cfg.visible;
				edit.cfg.visible = !edit.cfg.visible;
				textButton2.cfg.visible = !textButton2.cfg.visible;
			}
			item.refresh();
		});

		graph.on('button1:click', (evt) => {
			if (!reStart) return;
			const { item } = evt;
			reStart(item.getModel());
		});
		graph.on('button1:mouseover', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const textButton1 = group.find(
				(e) => e.get('name') === 'text-button1'
			);
			const restart = group.find((e) => e.get('name') === 'restart');
			evt.target.attr({ fill: '#F7F9FA' });
			textButton1.attr({ fill: '#0064C8' });
			restart.attr({ img: RestartHover });
		});
		graph.on('button1:mouseleave', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const textButton1 = group.find(
				(e) => e.get('name') === 'text-button1'
			);
			const restart = group.find((e) => e.get('name') === 'restart');
			evt.target.attr({ fill: '#fff' });
			textButton1.attr({ fill: '#999' });
			restart.attr({ img: Restart });
		});
		graph.on('text-button1:click', (evt) => {
			if (!reStart) return;
			const { item } = evt;
			reStart(item.getModel());
		});
		graph.on('text-button1:mouseover', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const button1 = group.find((e) => e.get('name') === 'button1');
			const restart = group.find((e) => e.get('name') === 'restart');
			evt.target.attr({ fill: '#0064C8' });
			button1.attr({ fill: '#F7F9FA' });
			restart.attr({ img: RestartHover });
		});

		graph.on('button2:click', (evt) => {
			if (!setEsVisible && !editConfiguration) return;
			if (serverData.type === 'elasticsearch') {
				setEsVisible();
			} else {
				editConfiguration();
			}
		});
		graph.on('button2:mouseover', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const textButton2 = group.find(
				(e) => e.get('name') === 'text-button2'
			);
			const edit = group.find((e) => e.get('name') === 'edit');
			evt.target.attr({ fill: '#F7F9FA' });
			textButton2.attr({ fill: '#0064C8' });
			edit.attr({ img: EditHover });
		});
		graph.on('button2:mouseleave', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const textButton2 = group.find(
				(e) => e.get('name') === 'text-button2'
			);
			const edit = group.find((e) => e.get('name') === 'edit');
			evt.target.attr({ fill: '#fff' });
			textButton2.attr({ fill: '#999' });
			edit.attr({ img: Edit });
		});
		graph.on('text-button2:click', (evt) => {
			if (!setEsVisible && !editConfiguration) return;
			if (serverData.type === 'elasticsearch') {
				setEsVisible();
			} else {
				editConfiguration();
			}
		});
		graph.on('text-button2:mouseover', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const button2 = group.find((e) => e.get('name') === 'button2');
			const edit = group.find((e) => e.get('name') === 'edit');
			evt.target.attr({ fill: '#0064C8' });
			button2.attr({ fill: '#F7F9FA' });
			edit.attr({ img: EditHover });
		});

		graph.on('button3:click', (evt) => {
			if (!openSSL) return;
			const { item } = evt;
			openSSL(item.getModel());
		});
		graph.on('text-button3:click', (evt) => {
			if (!openSSL) return;
			const { item } = evt;
			openSSL(item.getModel());
		});
		graph.on('button3:mouseover', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const textButton3 = group.find(
				(e) => e.get('name') === 'text-button3'
			);
			const control = group.find((e) => e.get('name') === 'control');
			evt.target.attr({ fill: '#F7F9FA' });
			textButton3.attr({ fill: '#0064C8' });
			control.attr({ img: ControlHover });
		});
		graph.on('button3:mouseleave', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const textButton3 = group.find(
				(e) => e.get('name') === 'text-button3'
			);
			const control = group.find((e) => e.get('name') === 'control');
			evt.target.attr({ fill: '#fff' });
			textButton3.attr({ fill: '#999' });
			control.attr({ img: Control });
		});
		graph.on('text-button3:mouseover', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const button3 = group.find((e) => e.get('name') === 'button3');
			const control = group.find((e) => e.get('name') === 'control');
			evt.target.attr({ fill: '#0064C8' });
			button3.attr({ fill: '#F7F9FA' });
			control.attr({ img: ControlHover });
		});

		// graph.on('breath:mouseover', (evt) => {
		// 	const { item } = evt;
		// 	const group = item.getContainer();
		// 	const breathBox = group.find((e) => e.get('name') === 'breath-box');
		// 	const breathText = group.find(
		// 		(e) => e.get('name') === 'breath-text'
		// 	);
		// 	if (setBackupObj) return;
		// 	breathBox.cfg.visible = true;
		// 	breathText.cfg.visible = true;
		// 	graph.refresh();
		// });
		// graph.on('breath:mouseleave', (evt) => {
		// 	const { item } = evt;
		// 	const group = item.getContainer();
		// 	const breathBox = group.find((e) => e.get('name') === 'breath-box');
		// 	const breathText = group.find(
		// 		(e) => e.get('name') === 'breath-text'
		// 	);
		// 	if (setBackupObj) return;
		// 	breathBox.cfg.visible = false;
		// 	breathText.cfg.visible = false;
		// 	graph.refresh();
		// });

		window.graph = graph;
	};

	useEffect(() => {
		if (window.graph) {
			setTimeout(() => {
				createTopo(direction);
			}, 0);
		}
	}, [topoData]);

	useEffect(() => {
		setTimeout(() => {
			createTopo(direction);
		}, 0);
	}, [direction]);

	const reset = () => {
		topoData.pods.length && topoData.pods.length >= 4
			? window.graph.fitView()
			: window.graph.fitCenter();
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
		setDirection(value);
	};

	return (
		<div className={styles['visualization']}>
			<h2 style={{ marginTop: 0 }}>
				{pathname.includes('addBackup')
					? backup
						? '选择要恢复的对象'
						: '选择备份对象'
					: '关系拓扑'}
			</h2>
			<div style={{ background: '#f9f9f9', height: '560px', ...option }}>
				<div className={styles['tools']}>
					<div>
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
				</div>
				<div id="topology" style={{ position: 'relative' }}></div>
				<div id="minimap" style={{ backgroundColor: ' #f9f9f9' }}></div>
			</div>
		</div>
	);
}

export default Visualization;
