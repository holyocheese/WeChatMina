// page/search/search.js
var app = getApp()
var baseUrl = app.globalData.requestBaseUrl
Page({
  data: {
      inputShowed: true,
      inputVal: "",
      historyArray:[],//历史搜索
      show_result:true,
      history_result:false,
      pickAdd:"",//提货地
      arriveAdd:"",//送货地
      sortType:"",//排序
      showData:[]//展示的数据
  },
  showInput: function () {
      this.setData({
          inputShowed: true
      });
  },
  hideInput: function () {
    this.setData({
       inputVal: "",
       history_result: false,
       show_result: true,
    });
  },
  clearInput: function () {
      this.setData({
          inputVal: "",
          show_result: true,
          history_result: false
      });
  },
  //跳转带参数搜索
  areaSearch: function (pickAdd, arriveAdd, sortType) {
    var truckData = wx.getStorageSync('truckData');
    var showData = []
    for (var i in truckData) {
      if (truckData[i].RCNAME == pickAdd || truckData[i].RDNAME == pickAdd || truckData[i].RPNAME ==pickAdd){
        showData.push(truckData[i])
        continue
      }
      if (truckData[i].SCNAME == arriveAdd || truckData[i].SDNAME == arriveAdd || truckData[i].SPNAME == arriveAdd) {
        showData.push(truckData[i])
        continue
      }
    }
    if(showData.length>0){
      this.setData({
        show_result: false,
        history_result: true,
      })
    }
    if(showData.length>1){
      switch (sortType){
        case 0:
          showData.sort(function (a, b) {
            return CompareDate(a.LST_UPD_TIME, b.LST_UPD_TIME) ? 1 : -1;
          });
          break
        case 1:
          showData.sort(function (a, b) {
            return CompareDate(a.REQ_PICK_STARTTIME, b.REQ_PICK_STARTTIME) ? 1 : -1;
          });
          break
        case 2:
          showData.sort(function (a, b) {
            return CompareDate(a.ETA_ENDTIME, b.ETA_ENDTIME) ? 1 : -1;
          });
          break
        case 3:
          showData.sort(function (a, b) {
            return CompareChinese(a.SCNAME, b.SCNAME)>0 ? 1 : -1;
          });
          break
      }
    }
    this.setData({
      showData: showData
    })
  },
  //输入的时候搜索
  inputTyping: function (e) {
    var self = this
    KeyWordSearch(e.detail.value,self)
  },
  //跳转详情
  clickUrlFun: function (e) {
    var historyArray = this.data.historyArray
    var isInHistory = false
    //判断是否在数组中
    for (var i in historyArray){
      if (historyArray[i] == this.data.inputVal){
        isInHistory = true
      }
    }
    //不在数组中 添加进历史
    if (!isInHistory){
      if (historyArray.length > 5) {
        historyArray.pop()
        histroyArray.unshift(this.data.inputVal)
        wx.setStorageSync("historyArray", historyArray)
      } else {
        historyArray.unshift(this.data.inputVal)
        wx.setStorageSync("historyArray", historyArray)
      }
    }
    var truckSN = e.currentTarget.dataset.trucknum
    var orderSN = e.currentTarget.dataset.ordersn
    var id = e.currentTarget.dataset.id
    var url = '../truckDetail/truckDetail?truckSN=' + truckSN + "&orderSN=" + orderSN + "&num=" + this.data._num + "&id=" + id;
    wx.redirectTo({
      url: url
    });
    return false;
  },
  choose:function(e){
    var self = this
    var thsIndex = e.currentTarget.dataset.text,
    list = this.data.historyArray;
    this.setData({
      inputVal: list[thsIndex],
      show_result: false,
      history_result: true
    })
    KeyWordSearch(list[thsIndex],self)
  },
  onLoad:function(options){
    var historyArray = wx.getStorageSync("historyArray")
    if (historyArray != null && historyArray!=""){
      this.setData({ historyArray: historyArray})
    }
    // 页面初始化 options为页面跳转所带来的参数
    if(options.sortType!=""){
      this.areaSearch(options.pickAdd, options.arriveAdd, options.sortType)
    }
  },
  onReady:function(){
    // 页面渲染完成
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
  //一键提货
  takeFun: function (e) {
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
                wx.request({
                  url: baseUrl + '/wxMina/queryList.do',
                  data: {
                    uId: uId,
                    state: '4',
                    plateNumber: plateNumber,
                  },
                  success: function (res) {
                    if (res.data.isSuccess) {
                      var truckData = res.data.data
                      wx.setStorageSync('truckData', truckData)
                      wx.showToast({
                        title: '提货成功',
                        duration: 1000,
                        mask: true,
                      })
                      //放置数据 
                      wx.reLaunch({
                        url: '../search/search'
                      })
                      //self.requestForData(self.data._num, self)
                    } else {
                      console.log("刷新数据失败")
                    }
                  }
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
  //到达
  fetchFun: function (e) {
    var self = this
    var orderId = e.currentTarget.dataset.orderid
    var uId = wx.getStorageSync('uId')
    var plateNumber = wx.getStorageSync("plateNum")
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
                //刷新数据
                wx.request({
                  url: baseUrl + '/wxMina/queryList.do',
                  data: {
                    uId: uId,
                    state: '4',
                    plateNumber: plateNumber,
                  },
                  success: function (res) {
                    if (res.data.isSuccess) {
                      var truckData = res.data.data
                      wx.setStorageSync('truckData', truckData)
                      wx.showToast({
                        title: '送达成功',
                        duration: 1000,
                        mask: true,
                      })
                      //放置数据
                      wx.reLaunch({
                        url: '../search/search'
                      })
                    } else {
                      console.log("刷新数据失败")
                    }
                  }
                })
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

//比较时间大小
function CompareDate(d1, d2) {
  return ((new Date(d1.replace(/-/g, "\/"))) > (new Date(d2.replace(/-/g, "\/"))));
}

//中文排序
function CompareChinese(param1, param2) {
  return param1.localeCompare(param2, "zh");
}

//关键词搜索
function KeyWordSearch(keyWord,self){
  var showData = []
  self.setData({ showData: showData })
  if (keyWord == "") {
    return false
  }
  //当前缓存数据
  var truckData = wx.getStorageSync('truckData');
  for (var i in truckData) {
    if (truckData[i].CLIENT_NUMBER.indexOf(keyWord) > -1) {
      showData.push(truckData[i])
      continue
    }
    if (truckData[i].TRUCKING_NUMBER.indexOf(keyWord) > -1) {
      showData.push(truckData[i])
      continue
    }
    if (truckData[i].RECIPIENT_NAME.indexOf(keyWord) > -1) {
      showData.push(truckData[i])
      continue
    }
    if (truckData[i].SENDERS_NAME.indexOf(keyWord) > -1) {
      showData.push(truckData[i])
      continue
    }
  }
  self.setData({
    showData: showData,
    show_result: false,
    history_result: true,
    inputVal: keyWord
  })
}