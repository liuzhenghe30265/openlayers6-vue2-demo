<!--
 * @Author: liuzhenghe
 * @Email: 15901450207@163.com
 * @Date: 2020-06-07 01:44:53
 * @LastEditors: liuzhenghe
 * @LastEditTime: 2020-09-21 11:27:04
 * @Descripttion: 热力图
-->

<template>
  <div id="map-container"
       style="width:100%;height:100%;">
    <div
         style="position:absolute;right:50px;top:50px;z-index:999;">
      <button
              @click="addHeatmapFun(heatmapData)">热力图</button>
      <button
              @click="removeLayerByName('热力图')">清除</button>
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
import OlSourceVector from 'ol/source/Vector'
import OlHeatmapLayer from 'ol/layer/Heatmap'
import GeoJSON from 'ol/format/GeoJSON'

export default {
  name: '',
  data() {
    return {
      // 热力图数据
      heatmapData: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Point',
            coordinates: [116.40182752977934, 39.92476619935702],
            count: 100,
          },
          {
            type: 'Point',
            coordinates: [116.42764915596571, 39.949683921105375],
            count: 200,
          },
          {
            type: 'Point',
            coordinates: [116.48107607733336, 39.88376327014636],
            count: 300,
          },
          {
            type: 'Point',
            coordinates: [116.43154238235083, 39.94546346522044],
            count: 400,
          },
          {
            type: 'Point',
            coordinates: [116.40311901342001, 39.92316223836612],
            count: 500,
          },
        ],
      },
      map: null,
    }
  },
  mounted() {
    this.initMap()
    // this.addHeatmapFun(this.heatmapData)
  },
  methods: {
    /**
     * @name: 热力图
     * @param {data} Object
     */
    addHeatmapFun(data) {
      let heatMapVector = new OlHeatmapLayer({
        source: new OlSourceVector({
          features: new GeoJSON().readFeatures(data),
        }),
        zIndex: 9,
        opacity: 0.5,
        name: '热力图',
        blur: 20, // 模糊尺寸
        radius: 20, // 热点半径
      })
      this.map.addLayer(heatMapVector)
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