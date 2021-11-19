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
		title: '进行中'
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
	const { topoData, serverData } = props;
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

	useEffect(() => {
		let url = window.location.href.split('/');
		let imagePath =
			url[url.length - 2] + '-' + url[url.length - 1] + '.svg';

		G6.registerNode(
			'tree-node',
			{
				drawShape: function drawShape(cfg, group) {
					console.log(cfg, serverData, group);
					const box = group.addShape('rect', {
						attrs: {
							fill: '#fff',
							stroke: '#666',
							x: 0,
							y: 0,
							width: 228,
							height: 100
						},
						name: 'rect-shape'
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
							height: 100
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
							height: 16
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
						name: 'text-shape1'
					});
					group.addShape('text', {
						attrs: {
							text: !cfg.depth
								? serverData.aliasName
								: '资源/存储: ' +
								  cfg.resources.cpu +
								  'C/' +
								  cfg.resources.memory +
								  'G/' +
								  cfg.resources.storageClassQuota,
							x: 45,
							y: 55,
							textBaseline: 'middle',
							fill: '#666',
							fontWeight: 400
						},
						name: 'text-shape2'
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
						name: 'status-image'
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
						visible: false,
						name: 'select-image'
					});
					const hasChildren = cfg.children && cfg.children.length > 0;
					group.addShape('rect', {
						attrs: {
							x: 0,
							y: 0,
							width: 76,
							height: 100,
							fill: '#595959',
							opacity: 0.7,
							cursor: 'pointer'
						},
						name: 'button1',
						visible: false
					});
					group.addShape('text', {
						attrs: {
							text: '重启',
							x: 35,
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
							fill: '#595959',
							opacity: 0.7,
							cursor: 'pointer'
						},
						visible: false,
						name: 'button2'
					});
					group.addShape('text', {
						attrs: {
							text: '修改',
							x: 115,
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
							fill: '#595959',
							opacity: 0.7,
							cursor: 'pointer'
						},
						visible: false,
						name: 'button3'
					});
					group.addShape('text', {
						attrs: {
							text: '控制台',
							x: 180,
							y: 50,
							textAlign: 'center',
							textBaseline: 'middle',
							fill: '#fff',
							cursor: 'pointer'
						},
						name: 'text-button3',
						visible: false
					});
					// 服务模式
					if (hasChildren && !cfg.depth) {
						// group.addShape('rect', {
						//     attrs: {
						//         width: 12,
						//         height: 12,
						//         x: 235,
						//         y: 44,
						//         radius: 6,
						//         cursor: 'pointer',
						//     },
						//     name: 'child-count-rect-shape',
						// });
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
			size: [window.innerWidth / 4, window.innerHeight / 4]
		});
		const graph = new G6.TreeGraph({
			container: 'topology',
			width,
			height,
			fitViewPadding: [20, 30, 20, 30],
			plugins: [minimap],
			modes: {
				default: [
					{
						type: 'tooltip',
						formatText(model) {
							return `<div class="tooltip">${
								podStatus.filter(
									(item) =>
										item.status === model.status ||
										item.status === serverData.status
								)[0]
									? podStatus.filter(
											(item) =>
												item.status === model.status ||
												item.status ===
													serverData.status
									  )[0].title
									: '运行异常'
							}</div>`;
						},
						offset: 10
						// shouldBegin: (e) => {
						//     if (e.target.get('name') === 'status') return true;
						//     return false;
						// },
					},
					'drag-canvas',
					'zoom-canvas'
				]
			},
			nodeStateStyles: {
				hover: {
					fill: '#595959',
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
				getWidth: function getWidth() {
					return 220;
				},
				getVGap: function getVGap() {
					return 30;
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
			: (res.children = topoData.listChildGroup.map(
					(item) => item.pods[0]
			  ));
		console.log('topoData', res, topoData);
		graph.data(res);
		graph.render();
		graph.fitCenter();
		graph.on('node:mouseenter', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const button1 = group.find((e) => e.get('name') === 'button1');
			const button2 = group.find((e) => e.get('name') === 'button2');
			const button3 = group.find((e) => e.get('name') === 'button3');
			const textButton1 = group.find(
				(e) => e.get('name') === 'text-button1'
			);
			const textButton2 = group.find(
				(e) => e.get('name') === 'text-button2'
			);
			const textButton3 = group.find(
				(e) => e.get('name') === 'text-button3'
			);
			button1.cfg.visible = true;
			button2.cfg.visible = true;
			button3.cfg.visible = true;
			textButton1.cfg.visible = true;
			textButton2.cfg.visible = true;
			textButton3.cfg.visible = true;
			graph.setItemState(item, 'hover', true);
		});
		graph.on('node:mouseleave', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			const button1 = group.find((e) => e.get('name') === 'button1');
			const button2 = group.find((e) => e.get('name') === 'button2');
			const button3 = group.find((e) => e.get('name') === 'button3');
			const textButton1 = group.find(
				(e) => e.get('name') === 'text-button1'
			);
			const textButton2 = group.find(
				(e) => e.get('name') === 'text-button2'
			);
			const textButton3 = group.find(
				(e) => e.get('name') === 'text-button3'
			);
			button1.cfg.visible = false;
			button2.cfg.visible = false;
			button3.cfg.visible = false;
			textButton1.cfg.visible = false;
			textButton2.cfg.visible = false;
			textButton3.cfg.visible = false;
			graph.setItemState(item, 'hover', false);
		});

		graph.on('node:click', (evt) => {
			const { item } = evt;
			const group = item.getContainer();
			graph.setItemState(item, 'select', true);
			const selectImage = group.find(
				(e) => e.get('name') === 'select-image'
			);
			selectImage.cfg.visible = true;
			// console.log(item._cfg.states.find(item => item === 'select'),'00000');
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
		};
		graph.on('collapse-text:click', (e) => {
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
		graph.on('button1:click', () => {
			console.log('button1');
		});
		graph.on('button2:click', () => {
			console.log('button2');
		});
		graph.on('button3:click', () => {
			console.log('button3');
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
			<h2>关系拓扑</h2>
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
			<div style={{ display: 'flex' }}>
				<div
					id="topology"
					style={{ background: '#f9f9f9', width: '70%' }}
				></div>
				<div
					id="minimap"
					style={{ background: '#f9f9f9', width: '30%' }}
				></div>
			</div>
		</div>
	);
}

export default Visualization;
