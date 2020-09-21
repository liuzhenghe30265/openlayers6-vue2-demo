<!--
 * @Author: liuzhenghe
 * @Email: 15901450207@163.com
 * @Date: 2020-06-07 10:31:25
 * @LastEditors: liuzhenghe
 * @LastEditTime: 2020-09-21 18:18:58
 * @Descripttion: 标绘
-->

<template>
  <div id="map-container"
       style="width:100%;height:100%;">
    <div
         style="position:absolute;right:50px;top:50px;z-index:999;">
      <button
              @click="plottingFun('Point')">点</button>
      <button
              @click="plottingFun('LineString')">线</button>
      <button
              @click="plottingFun('Polygon')">面</button>
      <button
              @click="plottingFun('Text')">文字</button>
      <button
              @click="removePlotting">清除</button>
    </div>
  </div>
</template>
<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { defaults as defaultControls } from 'ol/control'
import ZoomSlider from 'ol/control/ZoomSlider'
import OlStyleFill from 'ol/style/Fill'
import OlStyleStroke from 'ol/style/Stroke'
import OlStyleCircle from 'ol/style/Circle'
import OlLayerVector from 'ol/layer/Vector'
import OlSourceVector from 'ol/source/Vector'
import OlStyleStyle from 'ol/style/Style'
import OlStyleText from 'ol/style/Text'
import Draw from 'ol/interaction/Draw'

export default {
  name: '',
  data() {
    return {
      // 标绘
      plottingOption: {
        textVector: null,
        layer: null,
        sketch: null,
        draw: null,
        listener: null,
      },
      map: null,
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    /**
     * @name: 清除标绘
     */
    removePlotting() {
      this.removeLayerByName('标绘')
      this.map.removeInteraction(this.plottingOption.draw)
    },

    /**
     * @name: 添加交互
     * @param {type}
     */
    addInteractionFun(type) {
      console.log(type)
      this.map.removeInteraction(this.plottingOption.draw) // 防止多次点击添加多个图层
      let source = new OlSourceVector()
      // eslint-disable-next-line no-unused-vars
      let style = null
      let _type = type
      if (type !== 'Text') {
        _type = type
        style = new OlStyleStyle({
          fill: new OlStyleFill({
            color: 'rgba(255,255,255,.5)',
          }),
          stroke: new OlStyleStroke({
            color: 'blue',
            lineDash: [10, 10],
            width: 2,
          }),
          image: new OlStyleCircle({
            radius: 5,
            stroke: new OlStyleStroke({
              color: 'yellow',
            }),
            fill: new OlStyleFill({
              color: 'red',
            }),
          }),
        })
      } else {
        // 自定义文字标注
        _type = 'Point'
      }
      // 绘制时的样式
      this.plottingOption.draw = new Draw({
        source: source,
        type: _type,
        style: new OlStyleStyle({
          fill: new OlStyleFill({
            color: 'rgba(255,255,255,.5)',
          }),
          stroke: new OlStyleStroke({
            color: 'blue',
            lineDash: [10, 10],
            width: 2,
          }),
          image: new OlStyleCircle({
            radius: 5,
            stroke: new OlStyleStroke({
              color: 'yellow',
            }),
            fill: new OlStyleFill({
              color: 'red',
            }),
          }),
        }),
      })
      this.map.addInteraction(this.plottingOption.draw)
      this.plottingOption.draw.on('drawstart', evt => {
        if (type === 'Text') {
          this.$prompt('', '请输入文字', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
          })
            .then(({ value }) => {
              this.plottingOption.textVector = new OlLayerVector({
                source: source,
                style: new OlStyleStyle({
                  text: new OlStyleText({
                    font: '14px sans-serif',
                    maxAngle: 30,
                    offsetx: 10,
                    offsetY: 10,
                    text: value,
                    fill: new OlStyleFill({
                      color: '#000',
                    }),
                    stroke: new OlStyleStroke({
                      color: '#fff',
                      width: 5,
                    }),
                  }),
                }),
                zIndex: 9,
                name: '标绘',
              })
              this.map.addLayer(this.plottingOption.textVector)
              this.map.removeInteraction(this.plottingOption.draw)
            })
            .catch(() => {
              this.$message({
                type: 'info',
                message: '取消输入',
              })
              this.map.removeInteraction(this.plottingOption.draw)
            })
        } else {
          this.plottingOption.sketch = evt.feature
        }
      })

      // 将画好的 VectorLayer 图层添加到 map 中
      let plottingLayer = new OlLayerVector({
        source: source,
        style: new OlStyleStyle({
          fill: new OlStyleFill({
            color: 'rgba(255,255,255,.5)',
          }),
          stroke: new OlStyleStroke({
            color: 'blue',
            lineDash: [10, 10],
            width: 2,
          }),
          image: new OlStyleCircle({
            radius: 5,
            stroke: new OlStyleStroke({
              color: 'yellow',
            }),
            fill: new OlStyleFill({
              color: 'red',
            }),
          }),
        }),
        zIndex: 9,
        name: '标绘',
      })
      if (type !== 'Text') {
        this.map.addLayer(plottingLayer)
      }
    },

    /**
     * @name: 标绘功能
     * @param {type}
     */
    plottingFun(type) {
      this.addInteractionFun(type)
    },

    /**
     * @name: 清除覆盖图层
     * @param {ID} String 覆盖图层 ID
     */
    removeOverLay(ID) {
      let layer = this.getOverlays(ID)
      this.map.removeOverlay(layer)
    },

    /**
     * @name: 获取覆盖图层
     * @param {ID} String
     */
    getOverlays(ID) {
      if (ID) {
        // 获取指定 ID 的覆盖物图层
        let overlay = this.map.getOverlayById(ID)
        return overlay
      } else {
        // 获取所有覆盖物图层
        let layers = this.map.getOverlays().getArray()
        return layers
      }
    },

    /**
     * @name: 根据图层名移除图层
     * @param {layername} 图层名称
     */
    removeLayerByName(layerName) {
      this.getLayerByName(layerName)
      let layer = this.getLayerByName(layerName)
      layer.forEach(item => {
        this.map.removeLayer(item)
      })
    },

    /**
     * @name: 根据图层名获取图层
     * @param {layerName} 图层名称
     */
    getLayerByName(layerName) {
      let allLayers = this.getAllLayers()
      let layer = allLayers.filter(item => {
        return item.get('name') === layerName
      })
      return layer
    },

    /**
     * @name: 获取所有图层
     */
    getAllLayers() {
      let layers = this.map.getLayers().getArray()
      return layers
    },

    /**
     * @name: 地图单击事件
     */
    singleClickFun() {
      this.map.on('singleclick', event => {
        console.log(event)
      })
    },

    /**
     * @name: 初始化地图
     */
    initMap() {
      let view = new View({
        projection: 'EPSG:4326',
        center: [116.395645038, 39.9299857781],
        zoom: 12,
      })
      let layer = new TileLayer({
        source: new OSM(),
        visible: true,
        zIndex: 1,
        name: 'OSM',
      })
      this.map = new Map({
        layers: [],
        target: 'map-container',
        view: view,
        controls: defaultControls().extend([new ZoomSlider()]),
      })
      this.map.addLayer(layer)
      this.singleClickFun()
    },
  },
}
</script>