var tabArr = ['全部','待提货','待到达','提货即将超时','到达即将超时','超时未提货','超时未到达','已完成'];
var PcityArr = ['全部'];
var RcityArr = ['全部'];
var sortArr = ['更新时间倒序','要求提货时间正序',' 要求到达时间正序',' 城市名称正序'];
var funClass="background:#fff;";
var util = require('../../util/util.js');  
var nowTime = util.formatTime(new Date());
var app = getApp()
var baseUrl = app.globalData.requestBaseUrl
Page({
    data:{
         title:'',//上一页跳转的链接
         scrollLeft:'',
         list: tabArr,
         _num:"", //滑动菜单点击的index
         pickerText:'提货地',
         unloadText:'送货地',
         sort: sortArr,//排序项
         sortNum:'',//排序当前选择index
         isChooseSort:'更新时间倒序',//已选择排序
         sort_list: true,//排序选择模块，true表示隐藏
         show_result:false, //结果模块，true表示隐藏
         pick_city: true,//提货地模块，true表示隐藏
         unload_city: true,//送货地模块，true表示隐藏
         Pcity: PcityArr,//省份数组 
         thsPosition:'',
         pickCityClass:'',
         unloadCityClass:'',
         sortClass:'',
         showIcon1:'',
         showIcon2:'',
         showIcon3:'',
         showData:[],//要展示的数据
         searchData:[],//搜索用的数据                         
    },
    onLoad: function (options) {
      var self = this
      // 页面初始化 options为页面跳转所带来的参数
      var title = options.thsNum;
      if (title == undefined || title == "undefined" || title == null || title == "null" || title == "" || title=={}){
        console.log(12312)
        this.setData({
          _num: 0,
          scrollLeft:0
        }) 
      }else{
        this.setData({
          _num: title,
          scrollLeft: scrollLeft
        })
      }
       var scrollLeft = '';
       if (title > 3){
         scrollLeft = title*80;
         console.log(scrollLeft);
       }  
       this.reflashData()
    },
    onReady: function () {
      var self = this
      var position = getApp().globalData.thsPosition;
      this.setData({
        thsPosition:position
      })
      this.requestForData(parseInt(this.data._num), self)
    },
    //下拉刷新
    onPullDownRefresh:function(res){
      this.reflashData
    },
    //下拉刷新
    refesh: function (res) {
      this.reflashData
    },
    //点击选择菜单
    click_list:function(e){
      var self = this
      var num = e.target.dataset.num
      this.requestForData(parseInt(num),self)      
    },
    //点击"提货地"
    pickCityFun:function(e){
      var self = this
      var isclick = this.data.showIcon1,
          closeBox = false,
          icon ='show-icon',
          css = funClass;
      if (isclick == 'show-icon'){
        closeBox = true;
        icon = '';
        css="";
      }
        this.setData({
          showIcon1: icon,
          sort_list: true,
          show_result: !closeBox, 
          pick_city: closeBox,
          unload_city: true,
          pickCityClass: css,
          unloadCityClass: '',
          sortClass: ''
        })
      if (self.data.show_result) { 
        wx.request({
          url: baseUrl+"/wxMina/getArea.do",//获取第一级的地址
          data: {
            pCode: "0"
          },
          success: function (res) {
            var PcityArr = [{"name":"全部"}]
            for (var i in res.data) {
              PcityArr.push(res.data[i])
            }
            self.setData({
              PcityArr: PcityArr
            })
          },
          fail: function (res) {
            console.log("fail")
          }
        })
      }
    },
    //点击"送货地"
    unloadCityFun: function (e) {
      var self = this
      var isclick = this.data.showIcon2,
        closeBox = false,
        icon = 'show-icon',
        css = funClass;
      if (isclick == 'show-icon') {
        closeBox = true;
        icon = '';
        css = "";
      }
      this.setData({
        showIcon2: icon,
        sort_list: true,
        show_result: !closeBox,
        pick_city: true,
        unload_city: closeBox,
        pickCityClass: '',
        unloadCityClass: css,
        sortClass: ''
      })
      if (self.data.show_result) {
        wx.request({
          url: baseUrl+"/wxMina/getArea.do",//获取第一级的地址
          data: {
            pCode: "0"
          },
          success: function (res) {
            var RcityArr = [{"name":"全部"}]
            for (var i in res.data) {
              RcityArr.push(res.data[i])
            }
            self.setData({
              RcityArr: RcityArr
            })
          },
          fail: function (res) {
            console.log("fail")
          }
        })
      }
    },
    //点击"排序"
    sortFun:function(e){
      var isclick = this.data.showIcon3,
        closeBox = false,
        icon = 'show-icon',
        css = funClass;
      if (isclick == 'show-icon') {
        closeBox = true;
        icon = '';
        css = "";
      }
      this.setData({
        showIcon3: icon,
        sort_list: closeBox,
        show_result: !closeBox,
        pick_city: true,
        unload_city: true,
        pickCityClass: '',
        unloadCityClass:'',
        sortClass: css
      })
    },
    //提货地址选择
    pickChooseCity: function (e) {
      var self = this
      var pCode = e.currentTarget.dataset.pcode
      var isAll = e.currentTarget.dataset.text
      var PcityArr = [{ "name": "全部" }]
      wx.request({
        url: baseUrl+"/wxMina/getArea.do",//获取第一级的地址
        data: {
          pCode: pCode
        },
        success: function (res) {
          for (var i in res.data) {
            PcityArr.push(res.data[i])
          }
          self.setData({
            PcityArr: PcityArr
          })
          if (isAll == "全部") {
            self.setData({
              pick_city: true,
              unload_city: true,
              show_result: false,
              pickerText:'提货地',
            })
          }else{
            self.setData({
              pickerText: e.currentTarget.dataset.text,
              showIcon1: '',
              pick_city: false,
              pickCityClass: ''
            })
          }
          if (PcityArr.length == 1) {
            self.setData({
              pick_city: true,
              unload_city: true,
              show_result: false,
            })
          }
          self.areaSearch(self.data.pickerText, self.data.unloadText, self.data.sortNum)
        },
        fail: function (res) {
          console.log("fail")
        }
      })
    },
    //卸货地址选择
    unloadChooseCity: function (e) {
      var self = this
      var pCode = e.currentTarget.dataset.pcode
      var isAll = e.currentTarget.dataset.text
      var RcityArr = [{ "name": "全部"}]
      wx.request({
        url: baseUrl+"/wxMina/getArea.do",//获取第一级的地址
        data: {
          pCode: pCode
        },
        success: function (res) {
          for (var i in res.data) {
            RcityArr.push(res.data[i])
          }
          self.setData({
            RcityArr: RcityArr
          })
          if(isAll=="全部"){
            self.setData({
              pick_city: true,
              unload_city: true,
              show_result: false,
              pickerText: '送货地',
            })
          }else{
            self.setData({
              unloadText: e.currentTarget.dataset.text,
              showIcon1: '',
              unload_city: false,
              pickCityClass: ''
            })
          }
          if (RcityArr.length == 1 && RcityArr[0].name=="全部") {
            self.setData({
              pick_city: true,
              unload_city: true,
              show_result: false,
            })
          }
          self.areaSearch(self.data.pickerText, self.data.unloadText, self.data.sortNum)
        },
        fail: function (res) {
          console.log("fail")
        }
      })
    },
    //排序项选择
    click_sort: function (e) {
      var self = this
      this.setData({
        sortNum: e.target.dataset.sortnum,
        isChooseSort: sortArr[e.target.dataset.sortnum],
        showIcon3: '',
        sort_list: true,
        show_result: false,
        pick_city: true
      })
      self.areaSearch(self.data.pickerText, self.data.unloadText, self.data.sortNum)
    },
    callFun:function(e){
      wx.makePhoneCall({
        phoneNumber: e.currentTarget.dataset.phone, //此号码并非真实电话号码，仅用于测试
        success: function () {
          console.log("拨打电话成功！")
        },
        fail: function () {
          console.log("拨打电话失败！")
        }
      })
    },
    //跳转详情
    clickUrlFun:function(e){
      var truckSN = e.currentTarget.dataset.trucknum
      var orderSN = e.currentTarget.dataset.ordersn
      var id = e.currentTarget.dataset.id
      console.log(e)
      var url = '../truckDetail/truckDetail?truckSN=' + truckSN + "&orderSN=" + orderSN + "&num=" + this.data._num + "&id=" + id;
      wx.navigateTo({
        url: url
      });
      return  false;
    },

    //一键提货
    takeFun:function(e){
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
              url: baseUrl+"/wxMina/onPick.do",
              data: {
                orderId: orderId,
                uId: uId,
                uploadTruckingNumber: "",
                uType: "d"
              },
              success: function (res) {
                if (!res.data.isSuccess){
                  wx.showToast({
                    title: '提货失败',
                    duration: 1000,
                    mask: true,
                  })
                  wx.hideLoading()
                }else{//提货成功后刷新数据
                  //刷新数据
                  wx.request({
                    url: baseUrl+'/wxMina/queryList.do',
                    data: {
                      uId: uId,
                      state: '4',
                      plateNumber: plateNumber,
                    },
                    success:function(res){
                      if (res.data.isSuccess) {
                        var truckData = res.data.data
                        wx.setStorageSync('truckData', truckData)
                        wx.showToast({
                          title: '提货成功',
                          duration: 1000,
                          mask: true,
                        })
                        //放置数据
                        self.requestForData(self.data._num,self)
                      }else{
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
    fetchFun:function(e){
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
              url: baseUrl+"/wxMina/onArrive.do",
              data: {
                jsonData: '{"isUperror":"false","orderId":"' + orderId + '","uId":"'+uId+'","uType":"d"}'
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
                  if (isReceipt==1){
                    wx.navigateTo({
                      url: '../receipt/receipt?truckSN=' + truckSN + "&id=" + orderId + "&num=" + self.data._num,
                      success: function (res) {
                        // success
                      },
                    })
                  }
                  //刷新数据
                  wx.request({
                    url: baseUrl+'/wxMina/queryList.do',
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
                        self.requestForData(self.data._num, self)
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
    //搜索页面
    toSearch:function(res){
      var pickAdd = ""
      var arriveAdd = ""
      var sortType = "0"//0更新时间正序 1提货时间正序 2到达时间正序 3城市名称
      if (this.data.pickerText!="提货地"){
        pickAdd = this.data.pickerText
      }
      if (this.data.unloadText!="送货地"){
        arriveAdd = this.data.unloadText
      }
      wx.navigateTo({
        url: '../search/search?pickAdd=' + pickAdd + "&arriveAdd=" + arriveAdd + "&sortType=" + sortType,
      })
    },
    //补回单
    goreceipt: function (e) {
      var self = this
      var id = e.currentTarget.dataset.orderid
      var truckSN = e.currentTarget.dataset.trucksn
      wx.navigateTo({
        url: '../receipt/receipt?truckSN=' + truckSN + "&id=" + id + "&num=" + self.data._num,
        success: function (res) {
          // success
        },
      })
    },
    //刷新数据的方法
    reflashData:function(res){
      var self = this
      var uId = wx.getStorageSync('uId')
      var plateNumber = wx.getStorageSync("plateNum")
      //刷新数据
      wx.request({
        url: baseUrl+'/wxMina/queryList.do',
        data: {
          uId: uId,
          state: '4',
          plateNumber: plateNumber,
        },
        success: function (res) {
          if (res.data.isSuccess) {
            var truckData = res.data.data
            wx.setStorageSync('truckData', truckData)
            //放置数据
            self.requestForData(self.data._num, self)
          } else {
            console.log("刷新数据失败")
          }
        }
      })
    },
    //从服务器取对应数据
    requestForData:function(num,self){
      var truckData = wx.getStorageSync('truckData')
      var nowTime = util.formatTime(new Date())
      var showData = []
      self.setData({
        _num: num,
        showData: []
      })
      switch (num) {
        case 0://全部
          for (var item in truckData) {
            showData.push(truckData[item])
          }
          self.setData({ showData: showData, searchData: showData})
          break
        case 1://待提货
          for (var item in truckData) {
            if (truckData[item].STATUS == "ZL1606016") {
              showData.push(truckData[item])
            }
          }
          self.setData({ showData: showData, searchData: showData })
          break
        case 2://待到达
          for (var item in truckData) {
            if (truckData[item].STATUS == "ZL1606017") {
              showData.push(truckData[item])
            }
          }
          self.setData({ showData: showData, searchData: showData })
          break
        case 3://提货即将超时
          for (var item in truckData) {
            if (truckData[item].LIGHT_NO == 4) {
              showData.push(truckData[item])
            }
          }
          self.setData({ showData: showData, searchData: showData })
          break
        case 4://到达即将超时
          for (var item in truckData) {
            if (truckData[item].LIGHT_NO == 3) {
              showData.push(truckData[item])
            }
          }
          self.setData({ showData: showData, searchData: showData })
          break
        case 5://超时未提货
          for (var item in truckData) {
            if (truckData[item].LIGHT_NO == 2) {
              showData.push(truckData[item])
            }
          }
          self.setData({ showData: showData, searchData: showData })
          break
        case 6://超时未到达
          for (var item in truckData) {
            if (truckData[item].LIGHT_NO == 1 && truckData[item].STATUS != "ZL1606018" && truckData[item].STATUS != "ZL1606019" && truckData[item].STATUS != "ZL1606020") {
              showData.push(truckData[item])
            }
          }
          self.setData({ showData: showData, searchData: showData })
          break
        case 7://已完成
          for (var item in truckData) {
            if (truckData[item].STATUS == "ZL1606018" ||
              truckData[item].STATUS == "ZL1606019" ||
              truckData[item].STATUS == "ZL1606020") {
              showData.push(truckData[item])
            }
          }
          self.setData({ showData: showData, searchData: showData })
          break
      }
    },
    //下拉刷新
    onPullDownRefresh: function (res) {
      var self = this
      wx.reLaunch({
        url: '../taskManagement/taskManagement?thsNum=' + self.data._num
      })
    },
    //跳转带参数搜索
    areaSearch: function (pickAdd, arriveAdd, sortType) {
      var truckData = this.data.searchData
      var showData = []
      if (pickAdd != "提货地" && arriveAdd == "送货地"){//只搜索提货地
        for (var i in truckData) {
          if (truckData[i].RCNAME == pickAdd || truckData[i].RDNAME == pickAdd || truckData[i].RPNAME == pickAdd) {
            showData.push(truckData[i])
            continue
          }
        }
      }
      else if (pickAdd == "提货地" && arriveAdd != "送货地") {//只搜索送货地
        for (var i in truckData) {
          if (truckData[i].SCNAME == arriveAdd || truckData[i].SDNAME == arriveAdd || truckData[i].SPNAME == arriveAdd) {
            showData.push(truckData[i])
            continue
          }
        }
      } else if (pickAdd != "提货地" && arriveAdd != "送货地"){//同时搜索
        for (var i in truckData) {
          if ((truckData[i].SCNAME == arriveAdd || truckData[i].SDNAME == arriveAdd || truckData[i].SPNAME == arriveAdd) && (truckData[i].RCNAME == pickAdd || truckData[i].RDNAME == pickAdd || truckData[i].RPNAME == pickAdd)) {
            showData.push(truckData[i])
            continue
          }
        }
      }else{
        showData = truckData
      }
      console.log(showData)
      if (showData.length > 1) {
        switch (sortType) {
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
              return CompareChinese(a.SCNAME, b.SCNAME) > 0 ? 1 : -1;
            });
            break
        }
      }
      console.log(showData)
      this.setData({
        showData: showData
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
