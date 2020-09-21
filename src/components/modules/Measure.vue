<!--
 * @Author: liuzhenghe
 * @Email: 15901450207@163.com
 * @Date: 2020-06-06 17:13:04
 * @LastEditors: liuzhenghe
 * @LastEditTime: 2020-08-30 17:31:24
 * @Descripttion: 
-->

<template>
  <div id="map-container"
       style="width:100%;height:100%;">
    <div
         style="position:absolute;right:50px;top:50px;z-index:999;">
      <button
              @click="spaceMeasureFun('Point')">坐标测量</button>
      <button
              @click="spaceMeasureFun('LineString')">距离测量</button>
      <button
              @click="spaceMeasureFun('Polygon')">面积测量</button>
      <button
              @click="removeMeasureFun">清除</button>
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
import OlOverlay from 'ol/Overlay'
import OlGeomPoint from 'ol/geom/Point'
import OlLayerVector from 'ol/layer/Vector'
import OlSourceVector from 'ol/source/Vector'
import OlStyleStyle from 'ol/style/Style'
import { getArea, getLength } from 'ol/sphere.js'
import Draw from 'ol/interaction/Draw'
import { LineString, Polygon } from 'ol/geom'

export default {
  name: '',
  data() {
    return {
      // 空间测量
      measureOption: {
        layer: null,
        sketch: null,
        helpTooltipElement: null,
        helpTooltip: null,
        measureTooltipElement: null,
        measureTooltip: null,
        continuePolygonMsg: '',
        continueLineMsg: '',
        helpMsg: '',
        draw: null,
        listener: null,
        popupcloser: null,
      },
      map: null,
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    /**
     * @name: 清除空间测量
     */
    removeMeasureFun() {
      this.removeLayerByName('空间测量')
      this.removeAllOverlay()
    },

    /**
     * @name: 添加测量标注
     */
    createMeasureTooltip() {
      if (this.measureOption.measureTooltipElement) {
        this.measureOption.measureTooltipElement.parentNode.removeChild(
          this.measureOption.measureTooltipElement
        )
      }
      this.measureOption.measureTooltipElement = document.createElement('div')
      this.measureOption.measureTooltipElement.className =
        'ol-tooltip ol-tooltip-measure'
      this.measureOption.measureTooltip = new OlOverlay({
        id: '空间测量',
        element: this.measureOption.measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
      })
      this.map.addOverlay(this.measureOption.measureTooltip)
    },
    createHelpTooltip() {
      if (this.measureOption.helpTooltipElement) {
        this.measureOption.helpTooltipElement.parentNode.removeChild(
          this.measureOption.helpTooltipElement
        )
      }
      this.measureOption.helpTooltipElement = document.createElement('div')
      this.measureOption.helpTooltipElement.className = 'ol-tooltip hidden'
      this.measureOption.helpTooltip = new OlOverlay({
        id: '空间测量',
        element: this.measureOption.helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left',
      })
    },

    /**
     * @name: 测量交互
     * @param {measureType}
     */
    addInteractionFun(measureType) {
      this.map.removeInteraction(this.measureOption.draw) // 防止多次点击添加多个图层
      let source = new OlSourceVector()
      // 绘制时的样式
      this.measureOption.draw = new Draw({
        source: source,
        type: measureType,
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
      this.map.addInteraction(this.measureOption.draw)
      this.measureOption.draw.on('drawstart', evt => {
        this.measureOption.sketch = evt.feature
        let type = this.measureOption.sketch.getGeometry()
        if (type instanceof OlGeomPoint) {
          // 如果是绘制点
          let pointCoordinates = this.measureOption.sketch.getGeometry()
            .flatCoordinates
          this.measureOption.measureTooltipElement.innerHTML = pointCoordinates
          this.measureOption.measureTooltip.setPosition(pointCoordinates)
        } else {
          // 如果是绘制线和面
          let tooltipCoord = evt.coordinate
          this.measureOption.listener = this.measureOption.sketch
            .getGeometry()
            .on('change', evt => {
              let geom = evt.target
              let output
              if (geom instanceof Polygon) {
                output = this.formatArea(geom)
                tooltipCoord = geom.getInteriorPoint().getCoordinates()
              } else if (geom instanceof LineString) {
                output = this.formatLength(geom)
                tooltipCoord = geom.getLastCoordinate()
              }
              this.measureOption.measureTooltipElement.innerHTML = output
              this.measureOption.measureTooltip.setPosition(tooltipCoord)
            })
        }
      })

      this.measureOption.draw.on('drawend', () => {
        this.measureOption.measureTooltipElement.appendChild(
          this.measureOption.popupcloser
        )
        this.measureOption.measureTooltipElement.className =
          'ol-tooltip ol-tooltip-static'
        this.measureOption.measureTooltip.setOffset([0, -7])
        this.measureOption.sketch = null
        this.measureOption.measureTooltipElement = null
        this.createMeasureTooltip()
        this.map.un('pointermove', this.pointerMoveHandler)
        this.map.removeInteraction(this.measureOption.draw)
        this.measureOption.helpTooltipElement.classList.add('hidden')
      })
      // 将画好的 VectorLayer 图层添加到 map 中
      let measureLayer = new OlLayerVector({
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
        name: '空间测量',
      })
      this.map.addLayer(measureLayer)
      this.createMeasureTooltip()
      this.createHelpTooltip()
      // 删除测量标注
      this.measureOption.popupcloser = document.createElement('a')
      this.measureOption.popupcloser.innerHTML =
        '<span style="color:red;font-size:18px;">X</span>'
      this.measureOption.popupcloser.href = 'javascript:void(0);'
      this.measureOption.popupcloser.classList.add('ol-popup-closer')
      this.measureOption.popupcloser.onclick = e => {
        let parentNode = e.target.parentNode.parentNode.parentNode
        parentNode.remove()
        measureLayer.getSource().clear()
      }
    },

    /**
     * @name: 格式化距离
     * @param {line}
     */
    formatLength(line) {
      let sourceProj = this.map.getView().getProjection() // 获取投影坐标系
      let length = getLength(line, {
        projection: sourceProj,
      })
      let output
      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km'
      } else {
        output = Math.round(length * 100) / 100 + ' ' + 'm'
      }
      return output
    },

    /**
     * @name: 格式化面积
     * @param {polygon}
     */
    formatArea(polygon) {
      let sourceProj = this.map.getView().getProjection() // 获取投影坐标系
      let area = getArea(polygon, {
        projection: sourceProj,
      })
      let output
      if (area > 10000) {
        output =
          Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>'
      } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>'
      }
      return output
    },

    /**
     * @name: 移动点
     * @param {evt}
     */
    pointerMoveHandler(evt) {
      if (evt.dragging) {
        return
      }
      if (this.measureOption.sketch) {
        let geom = this.measureOption.sketch.getGeometry()
        if (geom instanceof Polygon) {
          this.measureOption.helpMsg = this.measureOption.continuePolygonMsg
        } else if (geom instanceof LineString) {
          this.measureOption.helpMsg = this.measureOption.continueLineMsg
        }
      }
      this.measureOption.helpTooltipElement.innerHTML = this.measureOption.helpMsg
      this.measureOption.helpTooltip.setPosition(evt.coordinate)
      this.measureOption.helpTooltipElement.classList.remove('hidden')
    },

    /**
     * @name: 空间测量
     * @param {measureType} String 测量类型
     */
    spaceMeasureFun(measureType) {
      this.map.on('pointermove', this.pointerMoveHandler)
      this.map.getViewport().addEventListener('mouseout', () => {
        this.measureOption.helpTooltipElement.classList.add('hidden')
      })
      this.addInteractionFun(measureType)
    },

    /**
     * @name: 清除所有覆盖图层
     */
    removeAllOverlay() {
      let layers = this.getOverlays()
      layers.forEach(item => {
        this.map.removeOverlay(item)
      })
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