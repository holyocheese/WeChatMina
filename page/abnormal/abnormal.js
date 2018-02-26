// page/abnormal/abnormal.js
var app = getApp()
var baseUrl = app.globalData.requestBaseUrl
Page({
  data:{
    _num:"",//跳转菜单
    errType: [{ "name": "货损", "code": "ZL1606050" },
     { "name": "服务人员投诉", "code": "ZL1608025" }, 
     { "name": "时效延误", "code":"ZL1608026"}, 
     { "name": "车辆异常", "code":"ZL1608027" }, 
     { "name": "货差", "code":"ZL1608028"},
     { "name": "订单信息有误", "code":"ZL1608029" }],
    rangekey: ["ZL1606050", "ZL1608025", "ZL1608026", "ZL1608027", "ZL1608028","ZL1608029"], 
    Index: 0,
    files: [],
    addhidden:'',
    id:"",
    selectErrType:"ZL1606050",//选择的异常类型
    errdescribe:"",//填写的异常描述
    imgServerPath:[],
    textCount:0,
    },
  chooseImage: function (e) {
      var that = this;
      wx.chooseImage({
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['camera', 'album'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
            //显示加载中
            wx.showLoading({
              title: '提交中',
              mask: true
            })
            var filePath = res.tempFilePaths
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            that.setData({
              files: that.data.files.concat(filePath)
            });
            //上传图片并获得返回路径
            wx.uploadFile({
              url: baseUrl+'/wxMina/uploadFile.do',
              filePath: filePath[0],
              name: 'name',
              formData: {
                'fileExtend': filePath[0].replace(/.+\./, "")
              },
              success: function (res) {
                wx.hideLoading()
                var path = res.data
                var pathArray = that.data.imgServerPath
                if (res.data) {
                  pathArray.push(path)
                }
                that.setData({
                  imgServerPath:pathArray
                })
              }, fail: function(res) {
                wx.showLoading({
                  title: '网络错误',
                  mask: true,
                  image:"../../images/error.png"
                })
              }
            })
            if(that.data.files.length>=6){
              that.setData({
                  addhidden: 'addhidden'
              });
            }
          }
      });
  },
  deleteimg:function(e){
    var index = this.data.files.indexOf(e.currentTarget.id);
    console.log(this.data.files)
    this.data.files.splice(index, 1);
    this.data.imgServerPath.splice(index, 1);
    this.setData({
      files: this.data.files,
      imgServerPath: this.data.imgServerPath,
      addhidden: ''
    });
    console.log(this.data.files)
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      id: options.id,
      _num: options.num
    })
  },
  //选择异常类型
  bindAccountChange: function(e) {
    var errType = this.data.errType
    this.setData({
      Index: parseInt(e.detail.value),
      selectErrType: errType[parseInt(e.detail.value)].code
    })
  },
  //输入异常描述
  errdescribe:function(e){
    var value = e.detail.value
    if (strlen(value)>=250){
      wx.showToast({
        title: '字数超过限制',
        duration: 1000,
        image: "../../images/error.png"
      })
      return
    }
    this.setData({
      errdescribe:value,
      textCount: strlen(value)
    })
  },
  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.files
    })
  },
  //提交异常
  onErr:function(){
    //显示加载中
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    var self = this
    var imgServerPath = self.data.imgServerPath
    var uId = wx.getStorageSync('uId')
    //拼接图片路径
    var errImage = ""
    for (var i in self.data.imgServerPath) {
      errImage += self.data.imgServerPath[i] + "~"
    }
    wx.request({
      url: baseUrl + "/wxMina/onErr.do",
      data: { 
        errType: self.data.selectErrType, 
        errdescribe: self.data.errdescribe,
        uId: uId,
        errImage: errImage,
        id: self.data.id
      },
      success:function(res){
        wx.hideLoading()
        if (res.data.success){
          wx.showToast({
            title: '登记成功',
            icon: "",
          })
          setTimeout(function(res){
            wx.reLaunch({
              url: '../taskManagement/taskManagement?thsNum=' + self.data._num
            })
          },1500)
        }else{
          wx.showToast({
            title: '登记失败',
            icon:""
          })
        }
      }
    })
  }
})

//计算字符串长度
function strlen(str) {
  var len = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    //单字节加1 
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      len++;
    }
    else {
      len += 2;
    }
  }
  return len;
}