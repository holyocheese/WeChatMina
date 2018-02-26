// page/truckDetail/truckDetail.js
var app = getApp()
var baseUrl = app.globalData.requestBaseUrl
Page({
  data:{
    id:"",//传递的ID
    truckSN : '',//传递的运单SN
    orderSN : '',//传递的ORDERSN
    showData : {},//展示的数据
    showImageData:[],
    fpsj:'',
    thsj:'',
    ddsj:'',
    bhdsj:'',
    hdsj:'',
    hdaddr:'../../images/hd.png',
    truckDetail_statu:'truckDetail-dth',
    _num: "",//之前页面的编号
    cargoType:""
  },
  goabnormal:function(){
    var self = this
    wx.navigateTo({
      url: '../abnormal/abnormal?truckSN=' + self.data.truckSN + "&id=" + self.data.id + "&num=" + self.data._num,
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },
  goreceipt:function(){
    var self = this
    wx.navigateTo({
      url: '../receipt/receipt?truckSN=' + self.data.truckSN + "&id=" + self.data.id + "&num=" + self.data._num,
      success: function(res){
        // success
      },
    })
  },
  onLoad:function(options){
    var self = this
    //显示加载中
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    // 页面初始化 options为页面跳转所带来的参数
    var truckSN = options.truckSN
    var orderSN = options.orderSN
    var id = options.id
    self.setData({ _num: options.num, id: id, orderSN: orderSN})
    // 搜索缓存内的运单
    var truckData = wx.getStorageSync("truckData")
    var showData = {}
    for (var i in truckData){
      if (truckData[i].TRACK_SN == truckSN){
        showData = truckData[i]
        self.setData({ showData: showData, truckSN: truckSN})
        console.log(showData)
        break
      }
    }
    //获取作业历史
    wx.request({
      url: baseUrl+"/wxMina/queryTrackDetail.do",
      data:{
        trackSN: truckSN
      },
      success:function(res){
        if(res.data!=""){
          for (var key in res.data){
            switch (res.data[key].operate){
              case "DZ0007":
                self.setData({
                  fpsj: res.data[key].lstUpdTime
                })
                break
              case "DZ0008":
                self.setData({
                  thsj: res.data[key].lstUpdTime
                })
                break
              case "DZ0009":
                self.setData({
                  ddsj: res.data[key].lstUpdTime
                })
                break
              case "DZ00011":
                self.setData({
                  bhdsj: res.data[key].lstUpdTime
                })
                break
              case "DZ00013":
                self.setData({
                  hdsj: res.data[key].lstUpdTime
                })
                break
            }
          }
        }
      },
    })
    //获取货物类型
    wx.request({
      url: baseUrl + "/wxMina/queryCargoType.do",
      data:{
        trackSN: truckSN
      },
      success: function (res) {
        console.log(res.data)
        if (res.data != "") {
          self.setData({
            cargoType: res.data.name
          })
        }else{
          console.log("获取货物类型失败")
        }
      }
    })
    //获取回单
    wx.request({
      url: baseUrl+"/wxMina/queryReceiptImage.do",
      data: {
        orderSN: self.data.orderSN
      },
      success: function (res) {
        if (res.data != "") {
          var showImageData = []
          for (var i in res.data){
            showImageData.push(baseUrl+"/"+res.data[i].imagePath)
          }
          self.setData({ showImageData: showImageData})
          console.log(self.data.showImageData)
        }
      }
    })
  },
  onReady:function(){
    // 页面渲染完成
    wx.hideLoading()
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  //强制撤回
  onRetract:function(res){
    var self = this
    if (self.data.showData.STATUS == "ZL1606020"){
      wx.showModal({
        title: '提示',
        content: '已回单运单不能撤销到达，如需帮助，请联系客服400-868-5656',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            return
          } 
        } 
      })
      return
    }
    wx.showModal({
      title: '提示',
      content: '确定要进行撤回吗',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: baseUrl + "/wxMina/onRetract.do",
            data: {
              ids: self.data.showData.ID
            },
            success: function (res) {
              if (!res.data.success) {
                wx.showModal({
                  title: '提示',
                  content: '此单不允许撤回，请联系客服',
                  showCancel: false
                })
                return
              } if (res.data.success) {
                wx.showToast({
                  title: '撤回成功',
                  icon: 'success',
                  complete: function (res) {
                    wx.reLaunch({
                      url: '../taskManagement/taskManagement?thsNum=' + self.data._num
                    })
                  }
                })
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //图片上传
  imgUpload:function(res){
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: baseUrl+'/wxMina/uploadFile.do', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'user': 'test'
          },
          success: function (res) {
            var data = res.data
            //do something
          }
        })
      }
    })
  },
  //一键提货
  onPick: function (e) {
    var self = this
    var orderId = e.currentTarget.dataset.orderid
    var uId = wx.getStorageSync('uId')
    var plateNumber = wx.getStorageSync("plateNum")
    wx.showModal({
      title: '提示',
      content: '确定要提货吗？',
      success: function (res) {
        if (res.confirm) {
          //显示加载中
          wx.showLoading({
            title: '提货中',
            mask: true
          })
          wx.request({
            url: baseUrl + "/wxMina/onPick.do",
            data: {
              orderId: orderId,
              uId: uId,
              uploadTruckingNumber: "",
              uType: "d"
            },
            success: function (res) {
              if (!res.data.isSuccess) {
                wx.showToast({
                  title: '提货失败',
                  duration: 1000,
                  mask: true,
                })
                wx.hideLoading()
              } else {//提货成功后刷新数据
                //刷新数据
                wx.reLaunch({
                  url: '../taskManagement/taskManagement?thsNum=' + self.data._num
                })
                wx.hideLoading()
              }
            },
            fail: function (res) {
              wx.hideLoading()
              wx.showToast({
                title: '提货失败',
                duration: 1000,
                mask: true,
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src
    var file = []
    file.push(current)
    wx.previewImage({
      current: current,
      urls: file
    })
  },
  //到达
  onArrive: function (e) {
    var self = this
    var orderId = e.currentTarget.dataset.orderid
    var uId = wx.getStorageSync('uId')
    var plateNumber = wx.getStorageSync("plateNum")
    var isReceipt = e.currentTarget.dataset.isreceipt
    var truckSN = e.currentTarget.dataset.trucksn
    console.log(e)
    wx.showModal({
      title: '提示',
      content: '确定要送达吗？',
      success: function (res) {
        if (res.confirm) {
          //显示加载中
          wx.showLoading({
            title: '提货中',
            mask: true
          })
          wx.request({
            url: baseUrl + "/wxMina/onArrive.do",
            data: {
              jsonData: '{"isUperror":"false","orderId":"' + orderId + '","uId":"' + uId + '","uType":"d"}'
            },
            success: function (res) {
              if (!res.data.isSuccess) {
                wx.showToast({
                  title: '送达失败',
                  duration: 1000,
                  mask: true,
                })
                wx.hideLoading()
              } else {//提货成功后刷新数据
                //最后一段做送达
                // if (isReceipt == 1) {
                //   wx.redirectTo({
                //     url: '../receipt/receipt?truckSN=' + truckSN + "&id=" + orderId + "&num=" + self.data._num,
                //     success: function (res) {
                //       // success
                //       return
                //     },
                //   })
                // }
                // else{
                  wx.reLaunch({
                    url: '../taskManagement/taskManagement?thsNum=' + self.data._num
                  })
                // }
                wx.hideLoading()
              }
            },
            fail: function (res) {
              wx.hideLoading()
              wx.showToast({
                title: '送达失败',
                duration: 1000,
                mask: true,
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
})