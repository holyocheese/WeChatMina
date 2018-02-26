var app = getApp()
var baseUrl = app.globalData.requestBaseUrl
Page({
  data: {
    show_result:true,//输入车牌后默认搜索的结果
    carNumberList: [],//输入车牌号自动搜索结果的列表数组
    alwayNumberList: [],//历史使用车牌号列表
    orgcode:[],//机构代码
    vehicleInfoList: [],//车辆搜索列表 
    selectOrgCode :"",//选择的机构代码
    selectPlateNum :"",//选择的车牌
    selectOrgName : "",//选择的机构名
    historySelect:[]//历史选择缓存数据
  },
  onLoad:function(){
    var self = this
    //显示加载中
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var account = ""
    try {
      var value = wx.getStorageSync('account')
      console.log(value)
      if (value!="") {
        account = value
      }
      else{
        wx.showToast({
          title: '请重新登录',
          icon: 'loading',
          duration: 2000,
          success: function () {
            wx.redirectTo({
              url: '../login/login'
            })
          }
        })
      }
    } catch (e) {
      wx.redirectTo({
        url: '../login/login'
      })
    }
    //载入历史车牌数据
    try {
      var value = wx.getStorageSync('historySelect')
      var alwayNumberList = []
      if (value>5) {
        for (var i = 0; i < 5; i++) {
          alwayNumberList.push(value[i][0] + "/" + value[i][1])
        }
        self.setData({
          alwayNumberList: alwayNumberList
        })
      }else{
        for (var i = 0; i < value.length; i++) {
          alwayNumberList.push(value[i][0] + "/" + value[i][1])
        }
        self.setData({
          alwayNumberList: alwayNumberList
        })
      }
    } catch (e) {
      console.log(e)
    }
    //查询账号组织机构&车牌
    wx.request({
      url: baseUrl+'/wxMina/queryOrgByAccount.do',
      data:{
        account: account,
      },
      success:function(res){
        wx.hideLoading()
        if(res.data.successful){
          var codearray = []
          for (var item in res.data.traTrackEntity){
            codearray.push(res.data.traTrackEntity[item])
          }
          self.setData({
            orgcode: codearray
          })
        }
        else{
          wx.showToast({
            title: '无法获取机构代码，请重新登录',
            duration: 1000
          })
        }
      }
    })
  },
  //显示搜索结果列表
  carNumber:function(e){
     var ThsValue = e.detail.value;
     var self = this
     var orgcode = ""
     if(ThsValue.length>=4){
       self.setData({ selectOrgCode: "", selectPlateNum: "", selectOrgName:"" })
       for (var item in self.data.orgcode) {
         orgcode += self.data.orgcode[item].code + ","
       }
       orgcode = orgcode.substring(0, orgcode.length-1)
      wx.request({
        url: baseUrl+"/wxMina/searchOrgCar.do",
        data: {
          searchWord: ThsValue,
          orgcode: orgcode
        },
        success:function(res){
          var carArray = []
          for(var index in res.data){
            carArray.push(res.data[index].plateNumber + "/" + getOrgName(res.data[index].org_Code,self.data.orgcode))
          }
          self.setData({
            carNumberList:carArray
          })
        }
      })
       this.setData({
         show_result:false
       })
     };
     if (ThsValue.length < 4) {
       self.setData({ selectOrgCode: "", selectPlateNum: "" })
       this.setData({
         show_result: true
       })
     };
  },
  //选择查询到结果
  ChoosefindFun:function(e){
    var thsNumber = e.currentTarget.dataset.index
    var carNumberList = this.data.carNumberList
    var array = carNumberList[thsNumber].split("/")
    var selectOrgCode = getOrgCode(array[1], this.data.orgcode)
    //保存数组
    array.push(selectOrgCode)
    this.setData({
      carNumber: carNumberList[thsNumber],
      show_result:true,
      selectOrgCode: selectOrgCode,
      selectPlateNum: array[0],
      selectOrgName: array[1],
      historySelect:array
    })
  },
  //选择最近使用结果
  ChooseAlwayFun:function(e){
    var historySelect = wx.getStorageSync("historySelect")
    var thsNumber = e.currentTarget.dataset.index,
        carNumberList = this.data.alwayNumberList;
    var array = historySelect[thsNumber]
    var selectOrgCode = array[3]
    this.setData({
      carNumber: array[0]+"/"+array[1],
      selectOrgCode: array[2],
      selectPlateNum: array[0],
      selectOrgName: array[1],
      historySelect: array
    })
  },
  //登录
  goHome:function(e){
    var orgCode = this.data.selectOrgCode
    var plateNum = this.data.selectPlateNum
    var orgName = this.data.selectOrgName
    var account = wx.getStorageSync('account')
    var self = this
    wx.request({
      url: app.globalData.requestBaseUrl +"/wxMina/checkPlateNum.do",
      data:{
        account: account,
        plateNum: plateNum,
        orgCode: orgCode,
      },
      success:function(res){
        if (res.data.successful){
          //保存当前机构、车牌、历史选择
          wx.setStorageSync("plateNum", plateNum)
          wx.setStorageSync("orgCode", orgCode)
          wx.setStorageSync("orgName", orgName)
          wx.setStorageSync("uId", res.data.traTrackEntity[0].id)
          try {
            var value = wx.getStorageSync('historySelect')
            if (value) {
              var count = 0
              for (var i = 0; i < value.length;i++){
                if (value[i][0] == self.data.historySelect[0]){
                  count = count + 1
                  break
                }
              }
              if (count==0){
                value.unshift(self.data.historySelect)
                wx.setStorageSync("historySelect", value)
              }
            }else{ 
              var obj = []
              obj.unshift(self.data.historySelect)
              wx.setStorageSync("historySelect", obj)
            }
          } catch (e) {
            console.log(e)
          }
          wx.switchTab({
            url: '../home/home'
          })
        }
        else{
          //显示加载中
          wx.showToast({
            title: '车牌号不存在',
            duration: 1000,
            image:"../../images/error.png"
          })
        }
      },
      fail:function(res){
        console.log("f")
      }
    })
  }
})
//机构代码获取机构名称
function getOrgName(code,codelist){
  for(var index in codelist){
    if (codelist[index].code==code){
      return codelist[index].name
    }
  }
}
//机构代码获取机构代码
function getOrgCode(name, codelist) {
  for (var index in codelist) {
    if (codelist[index].name == name) {
      return codelist[index].code
    }
  }
}



