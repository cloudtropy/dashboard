import React from 'react';
import echarts from 'echarts';
import moment from 'moment';
import { Card } from 'antd';
const colorPalette = ['#8884d8', '#82ca9d', '#fbb07d', '#95A5A6', '#C0392B', '#1ABC9C', '#F39C12', '#AF7AC5', '#dd6b66', '#ff7f50', '#759aa0', '#e69d87', '#8dc1a9', '#ea7e53', '#eedd78', '#73a373', '#73b9bc', '#7289ab', '#91ca8c', '#f49f42', '#2980B9', '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3', '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed', '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0', '#1e90ff', '#ff6347', '#7b68ee', '#00fa9a', '#ffd700', '#6b8e23', '#ff00ff', '#3cb371', '#b8860b', '#30e0e0']

export default class LineChart extends React.Component {
    componentDidMount() {
        //初始化echarts
        this.myChart = echarts.init(document.getElementById(this.props.id));
        this.getOption(this.props.data);
    }

    componentDidUpdate(prevProps, prevState) {
        Object.keys(this.props.data).length !== 0 ? this.getOption(this.props.data) : null
    }

    getOption = (data) => {
        //整理data
        let timestamp = [];
        let series = [];
        if (data) {
            if (data.xAxis && (data.xAxis.type == 'timestamp')) {
                data.xAxis.data.map(ele => {
                    timestamp.push(moment(ele).format('MM-DD HH:mm:ss'))
                })
            } else if (data.xAxis) {
                timestamp = data.xAxis.data
            }
            if (data && data.series) {
                data.series.map(ele => {
                    series.push({
                        name: ele.name,
                        data: ele.data,
                        type: 'line',
                        smooth: true,
                        showSymbol: true,
                        showAllSymbol: true,
                    })
                });
            }
        }
        //option
        var option = {
            title: {
                text: (data && data.title) ? data.title : '',
                left: 'center',
                top: '3%',
                textStyle: {
                    fontSize: 14
                },
            },
            color: colorPalette,
            dataZoom: { //缩放
                type: 'inside'
            },
            tooltip: {
                trigger: 'item', // axis
                formatter: (params, ticket) => {
                    return '时间：' + params.name + '<br/>' + params.seriesName + ' : ' + params.value + '<br/>'
                },
                // position:(point)=>{
                //     return[point[0]-100,'10%']
                // },
                // confine:true,
            },
            legend: {
                data: (data && data.legend) ? data.legend.data : [],
                right: 'right',
                type: 'scroll',
                orient: 'vertical',
                itemHeight: 10,
                itemWidth: 10,
                formatter: (name) => {
                    return name.length > 20 ? (name.slice(0, 20) + '...') : name
                },
                tooltip: {
                    show: true
                },
                icon: 'circle',
            },
            grid: {
                right: '22%'
            },
            toolbox: {
                show: true,
                left: 'left',
                feature: {
                    dataView: { readOnly: false },
                    magicType: { type: ['line', 'bar'] },
                    restore: {},
                    saveAsImage: {},
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                name: (data && data.xAxis) ? data.xAxis.name : '',
                nameLocation: 'middle',
                nameGap: 30,
                splitLine: { //网格线
                    show: true,
                    lineStyle: {
                        color: ['#ddd'],
                        type: 'dashed'
                    }
                },
                axisLabel: { //刻度
                    // interval:5,
                    textStyle: {
                        color: '#676a6c',
                        fontSize: 12
                    }
                },
                data: timestamp
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        color: ['#ddd'],
                        type: 'dashed'
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: '#676a6c',
                        fontSize: 12
                    },
                    formatter: '{value}'
                }
            },
            series: series
        };

        //判断是否需要添加编辑和删除图标
        if (this.props.myEditChart && this.props.myRemoveChart) {
            option.toolbox.feature.myEditChart = {
                show: true,
                title: '编辑图表',
                icon: 'image://' + require('../../assets/edit.png'),
                onclick: this.props.myEditChart,
            };
            option.toolbox.feature.myRemoveChart = {
                show: true,
                title: '删除图表',
                icon: 'image://' + require('../../assets/delete.png'),
                onclick: this.props.myRemoveChart,
            }
        }
        this.myChart.setOption(option);
    }

    render() {
        return (
            <Card style={{height:this.props.height,width:this.props.width}} id={this.props.id}></Card>
        )
    }
}