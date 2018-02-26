var app = getApp()
var baseUrl = app.globalData.requestBaseUrl
Page({
    data:{
        dth:0,            //待提货数
        ddd:0,            //待到达数
        thjjcs:0,         //提货即将超时数
        ddjjcs:0,         //到达即将超时数
        cswth:0,          //超时未提货数
        cswdd:0,          //超时未到达数
        rwl:0,          //完成任务数
        rwlpm:0,          //完成任务排名
        gls:0,          //行驶公里数
        glspm:0,          //行驶公里排名
        jr:[],          //加入圈子人
        array:['最近七天','最近30天','最近三个月','今年'],
        month:'最近30天',        
        inputShowed: false,
        inputVal: "",
    },
    //下拉刷新
    onPullDownRefresh: function (res) {
      var self = this
      loadMainData(self)
    },
    //页面加载时
    onLoad:function(){
      var self = this
      loadMainData(self)
    },
    //选择数据统计
    bindPickerChange: function(e) {
      var self = this
      console.log(this.data.array[e.detail.value])
      this.setData({
          month: this.data.array[e.detail.value]
      })
      var plateNumber = wx.getStorageSync('plateNum')
      var orgCode = wx.getStorageSync('orgCode')
      getRank(self, plateNumber, orgCode, e.detail.value)
    },
    //查询
    gosearch:function(){
      wx.navigateTo({
        url: '../search/search?keyWord=' + this.data.inputVal
      })
    },
    //待提货
    waitFun: function (e) {
      console.log("待提货");
      this.urlFun(1);
    },
    //待到达
    arriveFun: function (e) {
      console.log("待到达");
      this.urlFun(2);
    },
    //提货即将超时
    pickOverTimeSoonFun: function (e) {
      console.log("提货即将超时");
      this.urlFun(3);
    },
    //到达即将超时
    arriveOverTimeSoonFun: function (e) {
      console.log("到达即将超时");
      this.urlFun(4);
    },
    //超时未提货
    overTimeNoPickFun:function(e){
      console.log("超时未提货");
      this.urlFun(5);
    },
    //超时未到达
    overTimeNoArriveFun:function(e){
      console.log("超时未到达");
      this.urlFun(6);
    },
    urlFun:function (status){
      console.log('../taskManagement/taskManagement?thsNum=' + status);
      wx.reLaunch({
          url: '../taskManagement/taskManagement?thsNum=' + status
        })
    },
    doewm:function(){
      // 只允许从相机扫码
      wx.scanCode({
        onlyFromCamera: true,
        success: (res) => {
          console.log(res)
        }
      })
    }
})

function loadMainData(self){
  //显示加载中
  wx.showLoading({
    title: '数据加载中',
    mask: true
  })
  var uId = wx.getStorageSync('uId')
  var plateNumber = wx.getStorageSync('plateNum')
  var orgCode = wx.getStorageSync('orgCode')
  //取在途数据
  wx.request({
    url: baseUrl+'/wxMina/queryList.do',
    data: {
      uId: uId,
      state: '4',
      plateNumber: plateNumber,
    },
    success: function (res) {
      var data = {
        dth: 0,            //待提货数
        ddd: 0,            //待到达数
        thjjcs: 0,         //提货即将超时数
        ddjjcs: 0,         //到达即将超时数
        cswth: 0,          //超时未提货数
        cswdd: 0,          //超时未到达数
      }
      if (res.data.isSuccess) {
        var truckData = res.data.data
        wx.setStorageSync('truckData', truckData)
        for (var i in truckData) {
          //循环获取各个状态在途数量
          switch (truckData[i].LIGHT_NO) {
            case 1:
              if (truckData[i].STATUS == "ZL1606017" || truckData[i].STATUS == "ZL1606016"){
                data.cswdd += 1
              }
              break;
            case 2:
              data.cswth += 1
              break;
            case 3:
              data.ddjjcs += 1
              break;
            case 4:
              data.thjjcs += 1
              break;
            default:
              break;
          }
          //循环获取各个状态在途数量
          switch (truckData[i].STATUS) {
            case "ZL1606016":
              data.dth += 1
              break;
            case "ZL1606017":
              data.ddd += 1
              break;
            default:
              break;
          }
        }
        self.setData({
          dth: data.dth,
          ddd: data.ddd,
          thjjcs: data.thjjcs,         //提货即将超时数
          ddjjcs: data.ddjjcs,         //到达即将超时数
          cswth: data.cswth,          //超时未提货数
          cswdd: data.cswdd,
        })
        wx.hideLoading()
        wx.stopPullDownRefresh()
      } else {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        console.log("error:" + res.data)
      }
    },
    fail: function (res) {
      wx.hideLoading()
      wx.stopPullDownRefresh()
    }
  })
  getRank(self, plateNumber, orgCode, "1")
  //获取最新司机
  wx.request({
    url: baseUrl +"/wxMina/queryNewDriver.do",
    success: function (res) {
      if (res.data != "" || res.data != null) {
        var jr = []
        var time = ''
        for (var i in res.data) {
          time = res.data[i].creatTime
          var obj = { time: time.substring(0, time.length - 3), name: res.data[i].driverName }
          jr.push(obj)
        }
        self.setData({ jr: jr })
      }
    }
  })
}

//获取排名
function getRank(self, plateNumber,orgCode,which){
  var days = "";
  switch (which){
    case "0":
      console.log("!!!!!!")
      days = "7"
      break
    case "1":
      days = "30"
      break
    case "2":
      days = "90"
      break
    case "3":
      days = "256"
      break
  }
  wx.request({
    url: baseUrl + "/wxMina/rank.do",
    data:{
      plateNumber: plateNumber,
      orgCode:orgCode,
      days:days
    },
    success: function (res) {
      if (res.data.mileage!=null){
        self.setData({
          rwl: res.data.messioncount,          //完成任务数
          rwlpm: res.data.messionrank,          //完成任务排名
          gls: res.data.mileage,          //行驶公里数
          glspm: res.data.milerank,          //行驶公里排名
        })
      }else{
        self.setData({
          rwl: res.data.messioncount,          //完成任务数
          rwlpm: res.data.messionrank,          //完成任务排名
          gls: "暂无记录",                    //行驶公里数
          glspm: res.data.milerank,          //行驶公里排名
        })
      }
    }
  })
}
