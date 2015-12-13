(function() {
  angular.module('app', ['onsen'])
  .factory('currentlyUserModel', function(){
    return {
      user: {
        id: 0,
        screen_name: "ななし",
        email: "nanashi@example.com",
        user_id: 0,
        created_at: "2015-12-13T06:55:11.893Z",
        updated_at: "2015-12-13T06:55:11.893Z"
      }
    }
  })
  .factory('todoModel', function(){
    return {
      items: [{
        title: 'Water the plants',
        done: false,
      },
      {
        title: 'Walk the dog',
        done: true,
      },
      {
        title: 'Go to the dentist',
        done: false,
      },
      {
        title: 'Buy milk',
        done: false,
      },
      {
        title: 'Play tennis',
        done: true,
      }]
    }
  })
  .controller('LandingController', function($scope, $timeout) {
    if(localStorage.getItem('switch-site_url')){
      if(!localStorage.getItem('switch-auth_token')){
          app.navi.pushPage("./login.html", {animation: 'slide'})
      }else{
        site_url= localStorage.getItem('switch-site_url')
        auth_token=localStorage.getItem('switch-auth_token')
        $.ajax({
          url: site_url + "/api/v1/user/info.json",
          type: "GET",
          data: {
            "auth_token": auth_token,
          },
          success: function(msg){
            app.navi.pushPage("./infrared_groups/index.html", {animation: 'slide'})
          },
          error: function(msg){
            console.log(msg)
            if(msg.status = 404){
              app.navi.pushPage("./404/index.html", {animation: 'lift'})
            }else{
              app.navi.pushPage("./signup/index.html", {animation: 'slide'})
            }
          }
        });
      }
    }else{
      app.navi.pushPage("./404/index.html", {animation: 'lift'})
    }
  })
  .controller('SignupController', function($scope, $timeout) {
    console.log("kita")
  })
  .controller('ErrorUrlController', function($scope, $timeout) {

    this.newSiteUrl = function() {
      console.log("hoge")
      site_url = $("#url").val()
      console.log(site_url)
      $.ajax({
        url: "" + site_url + "/api/v1/auth/token.json",
        type:"GET",
        success: function(msg){
          localStorage.setItem("switch-site_url", "" + site_url)
          localStorage.setItem("switch-auth_token",msg["response"]["auth_token"]);
          console.log("success")
          app.navi.pushPage("./signup.html", { animation: "slide" });
        },
        error: function(error){
          if(error.status == 404 || error.status == 0){
            localStorage.setItem("switch-site_url","")
            $("#error_messages").html("<ul><li class='error'>URLが誤っています</li></ul>");
          }else{
            text = "<ul>";
            messages = error.responseJSON.meta.errors.forEach(function(err){
              text += "<li class='error'>" + err.message + "</li>";
            });
            text += "</ul>"
            $("#error_messages").html(text);
          }
        }
      });
    }.bind(this);

  })
  .controller('TodoController', function($scope, $timeout, todoModel) {
    $scope.todoModel = todoModel;
    // this.items = [
    //   {
    //     title: 'Water the plants',
    //     done: false,
    //   },
    //   {
    //     title: 'Walk the dog',
    //     done: true,
    //   },
    //   {
    //     title: 'Go to the dentist',
    //     done: false,
    //   },
    //   {
    //     title: 'Buy milk',
    //     done: false,
    //   },
    //   {
    //     title: 'Play tennis',
    //     done: true,
    //   }
    // ]

    this.newTodo = function() {
      // this.items.push({
      //   title: '',
      //   done: false
      // });
      todoModel.items.push({
        title: '',
        done: false
      });
    }.bind(this);

    this.focusInput = function(event) {
      $timeout(function() {
        var item = event.target.parentNode.querySelector('input[type="text"]');
        item.focus();
        item.select();
      });
    }

    this.clearCompleted = function() {
      // this.items = this.items.filter(function(item) {
      //   return !item.done;
      // });
      todoModel.items = todoModel.items.filter(function(item) {
        return !item.done;
      });
    }.bind(this);

    this.selectedItem = -1;
  });
})();
