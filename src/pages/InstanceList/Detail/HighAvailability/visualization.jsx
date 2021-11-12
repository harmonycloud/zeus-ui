import React, { useState, useEffect } from 'react';
import styles from './esEdit.module.scss';
import G6 from '@antv/g6'
import { Button, Icon } from '@alicloud/console-components';
import CustomIcon from '@/components/CustomIcon';

const type = [
    {}
]

function Visualization(props) {
    const { topoData, serverData } = props;
    let count = 1;

    const hasConfigBackup = (cfg) => {
        if (!cfg.depth) {
            if (serverData.hasConfigBackup) {
                return true;
            } else {
                return false
            }
        } else {
            if (cfg.hasConfigBackup) {
                return true
            } else {
                return false
            }
        }
    }

    useEffect(() => {
        G6.registerNode(
            'tree-node',
            {
                drawShape: function drawShape(cfg, group) {
                    console.log(cfg);
                    const rect = group.addShape('rect', {
                        attrs: {
                            fill: '#fff',
                            stroke: '#666',
                            x: 0,
                            y: 0,
                            width: 220,
                            height: 100
                        },
                        name: 'rect-shape',
                    });
                    group.addShape('rect', {
                        attrs: {
                            fill: '#1E8E3E',
                            x: 0,
                            y: 0,
                            width: 40,
                            height: 100
                        },
                        name: 'status',
                    });
                    group.addShape('text', {
                        attrs: {
                            text: !cfg.depth ? serverData.name : 'IP ' + cfg.podIp,
                            x: 45,
                            y: 30,
                            textBaseline: 'middle',
                            fill: '#666',
                        },
                        name: 'text-shape1',
                    });
                    group.addShape('text', {
                        attrs: {
                            text: !cfg.depth ? serverData.aliasName : '资源/存储 ' + cfg.resources.cpu + 'C/' + cfg.resources.memory + 'G/' + cfg.resources.storageClassQuota,
                            x: 45,
                            y: 65,
                            textBaseline: 'middle',
                            fill: '#666',
                        },
                        name: 'text-shape2',
                    });
                    group.addShape('rect', {
                        attrs: {
                            x: 200,
                            y: 0,
                            width: 20,
                            height: 100,
                            fill: '#6236FF',
                        },
                        visible: hasConfigBackup(cfg),
                        name: 'right',
                    });
                    group.addShape('text', {
                        attrs: {
                            text: '已',
                            x: 204,
                            y: 30,
                            fill: '#fff',
                        },
                        visible: hasConfigBackup(cfg),
                        name: 'text1',
                    });
                    group.addShape('text', {
                        attrs: {
                            text: '设',
                            x: 204,
                            y: 42,
                            fill: '#fff',
                        },
                        visible: hasConfigBackup(cfg),
                        name: 'text2',
                    });
                    group.addShape('text', {
                        attrs: {
                            text: '置',
                            x: 204,
                            y: 54,
                            fill: '#fff',
                        },
                        visible: hasConfigBackup(cfg),
                        name: 'text3',
                    });
                    group.addShape('text', {
                        attrs: {
                            text: '备',
                            x: 204,
                            y: 66,
                            fill: '#fff',
                        },
                        visible: hasConfigBackup(cfg),
                        name: 'text4',
                    });
                    group.addShape('text', {
                        attrs: {
                            text: '份',
                            x: 204,
                            y: 78,
                            fill: '#fff',
                        },
                        visible: hasConfigBackup(cfg),
                        name: 'text-5',
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
                            cursor: 'pointer',
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
                        name: 'button2',
                    });
                    group.addShape('text', {
                        attrs: {
                            text: '修改',
                            x: 115,
                            y: 50,
                            textAlign: 'center',
                            textBaseline: 'middle',
                            fill: '#fff',
                            cursor: 'pointer',
                        },
                        visible: false,
                        name: 'text-button2',
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
                        name: 'button3',
                    });
                    group.addShape('text', {
                        attrs: {
                            text: '控制台',
                            x: 180,
                            y: 50,
                            textAlign: 'center',
                            textBaseline: 'middle',
                            fill: '#fff',
                            cursor: 'pointer',
                        },
                        name: 'text-button3',
                        visible: false
                    });
                    if (hasChildren) {
                        group.addShape('marker', {
                            attrs: {
                                x: 230,
                                y: 44,
                                r: 6,
                                symbol: cfg.collapsed ? G6.Marker.expand : G6.Marker.collapse,
                                stroke: '#666',
                                lineWidth: 2,
                            },
                            name: 'collapse-icon',
                        });
                    }
                    return rect;
                },
                update: (cfg, item) => {
                    const group = item.getContainer();
                    const icon = group.find((e) => e.get('name') === 'collapse-icon');
                    icon.attr('symbol', cfg.collapsed ? G6.Marker.expand : G6.Marker.collapse);
                },
            },
            'single-node',
        );

        const topology = document.getElementById('topology');
        const width = topology.scrollWidth || 1000;
        const height = topology.scrollHeight || 480;
        const graph = new G6.TreeGraph({
            container: 'topology',
            width,
            height,
            fitViewPadding: [20, 30, 20, 30],
            modes: {
                default: [
                    {
                        type: 'collapse-expand',
                        onChange: function onChange(item, collapsed) {
                            const data = item.get('model');
                            graph.updateItem(item, {
                                collapsed,
                            });
                            data.collapsed = collapsed;
                            return true;
                        },
                    },
                    'drag-canvas',
                    'zoom-canvas',
                ],
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
                // anchorPoints: [
                //   [0, 0.5],
                //   [1, 0.5],
                // ],
            },
            defaultEdge: {
                type: 'cubic-horizontal',
                style: {
                    stroke: '#A3B1BF',
                },
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
                    return 50;
                },
                getHGap: function getHGap() {
                    return 50;
                },
            },
        });
        let res = {
            id: '111'
        }
        res.children = topoData.pods;
        console.log(res);
        graph.data(res);
        graph.render();
        graph.fitView();
        graph.zoom(1);
        graph.on('node:mouseenter', (evt) => {
            const { item } = evt;
            const group = item.getContainer();
            const button1 = group.find((e) => e.get('name') === 'button1');
            const button2 = group.find((e) => e.get('name') === 'button2');
            const button3 = group.find((e) => e.get('name') === 'button3');
            const textButton1 = group.find((e) => e.get('name') === 'text-button1');
            const textButton2 = group.find((e) => e.get('name') === 'text-button2');
            const textButton3 = group.find((e) => e.get('name') === 'text-button3');
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
            const textButton1 = group.find((e) => e.get('name') === 'text-button1');
            const textButton2 = group.find((e) => e.get('name') === 'text-button2');
            const textButton3 = group.find((e) => e.get('name') === 'text-button3');
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
            graph.setItemState(item, 'select', true);
            console.log('node');
        })
        graph.on('button1:mouseenter', (evt) => {
            const { item } = evt;
            const group = item.getContainer();
            const button1 = group.find((e) => e.get('name') === 'button1');
            button1.attrs.fill = '#000';
        })
        graph.on('button1:mouseleave', (evt) => {
            const { item } = evt;
            const group = item.getContainer();
            const button1 = group.find((e) => e.get('name') === 'button1');
            button1.attrs.fill = '#595959';
        })
        graph.on('button2:mouseenter', (evt) => {
            const { item } = evt;
            const group = item.getContainer();
            const button2 = group.find((e) => e.get('name') === 'button2');
            button2.attrs.fill = '#000';
        })
        graph.on('button2:mouseleave', (evt) => {
            const { item } = evt;
            const group = item.getContainer();
            const button2 = group.find((e) => e.get('name') === 'button2');
            button2.attrs.fill = '#595959';
        })
        graph.on('button3:mouseenter', (evt) => {
            const { item } = evt;
            const group = item.getContainer();
            const button3 = group.find((e) => e.get('name') === 'button3');
            button3.attrs.fill = '#000';
        })
        graph.on('button3:mouseleave', (evt) => {
            const { item } = evt;
            const group = item.getContainer();
            const button3 = group.find((e) => e.get('name') === 'button3');
            button3.attrs.fill = '#595959';
        })
        graph.on('button1:click', () => {
            console.log('button1');
        })
        graph.on('button2:click', () => {
            console.log('button2');
        })
        graph.on('button3:click', () => {
            console.log('button3');
        })

        window.graph = graph;
    }, [])

    const reset = () => {
        window.graph.fitCenter();
        window.graph.fitView();
    }

    const bingger = () => {
        count++;
        window.graph.zoom((Math.round(window.graph.getZoom() * 10) + count) / 10);
    }

    const smaller = () => {
        count++;
        window.graph.zoom((Math.round(window.graph.getZoom() * 10) - count) / 10);
    }


    return (
        <div className={styles["visualization"]}>
            <h2>关系拓扑</h2>
            <div className={styles["tools"]}>
                <Button>
                    <Icon type="arrows-alt" />
                </Button>
                <Button>
                    <Icon type="Directory-tree" onClick={() => window.graph.updateLayout({
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
                            return 50;
                        },
                        getHGap: function getHGap() {
                            return 50;
                        },
                    })} />
                </Button>
                <Button>
                    <CustomIcon type='icon-shuxiangjiegou' size={12} onClick={() => window.graph.updateLayout({
                        type: 'compactBox',
                        direction: 'TB',
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
                            return 50;
                        },
                        getHGap: function getHGap() {
                            return 50;
                        },
                    })} />
                </Button>
                <Button>
                    <Icon type="add" onClick={bingger} />
                </Button>
                <Button>
                    <Icon type="minus" onClick={smaller} />
                </Button>
                <Button>
                    <CustomIcon type='icon-yuandian' size={12} onClick={reset} />
                </Button>
            </div>
            <div id='topology' style={{ background: "#f9f9f9" }}></div>
        </div>
    );
}

export default Visualization;