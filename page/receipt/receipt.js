// page/receipt/receipt.js
var app = getApp()
var baseUrl = app.globalData.requestBaseUrl
Page({
  data: {
      id:"",//传递的ID
      truckSN:"",//传递的SN
      _num:"",//传递的菜单编号
      files: [],
      addhidden:'',
      imgServerPath:[]
    },
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var filePath = res.tempFilePaths
        //显示加载中
        wx.showLoading({
          title: '提交中',
          mask: true
        })
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
              imgServerPath: pathArray
            })
          },
        })
        if (that.data.files.length >= 6) {
          that.setData({
            addhidden: 'addhidden'
          });
        }
      },fail:function(res){
        wx.hideLoading()
      }
    });
  },
  deleteimg:function(e){
    var index = this.data.files.indexOf(e.currentTarget.id);
    console.log(e.currentTarget.id)
    console.log(index)
    this.data.files.splice(index, 1);
    this.setData({
      files: this.data.files,
      addhidden: ''
    });
  },
  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.files
    })
  },
  onLoad:function(options){
    console.log(options)
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({ id: options.id, truckSN: options.truckSN,_num:options.num})
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
  receipt:function(){
    var self = this
    console.log()
    if (self.data.imgServerPath.length==0){
      wx.showToast({
        title: '请上传回单',
        duration: 1000,
        image: "../../images/error.png"
      })
      return
    }
    //显示加载中
    wx.showLoading({
      title: '回单中',
      mask: true
    })
    var picPathName = ""
    for (var i in self.data.imgServerPath){
      picPathName += self.data.imgServerPath[i] + "~"
    }
    console.log(self.data.truckSN)
    wx.request({
      url: baseUrl+'/wxMina/receiptImg.do',
      data: { picPathName: picPathName, id: self.data.id, truckSN: self.data.truckSN},
      success:function(res){
        console.log(res.data)
        wx.hideLoading()
        if(!res.data.success){
          wx.showToast({
            title: '保存失败',
          })
        }else{
          wx.showToast({
            title: '保存成功',
            complete:function(res){
              wx.reLaunch({
                url: '../taskManagement/taskManagement?thsNum=' + self.data._num
              })
            }
          })
        }
      }
    })
  }
})