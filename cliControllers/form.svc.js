angular.module('app')
.service('FormSvc', function (ApiSvc, $q, $timeout, $window, $location, $uibModal, ApplicationSvc, QuestionnaireSvc) {
	var svc=this

  svc.setOptions=function (scope,options) {
    scope.FormSvcOptions=angular.extend({
      fetchAPI:'',
      fetchTarget:'',
      saveAPI:'',
      savePrefix:'',
      dateFields:[],
      timeFields:[],
      numberFields:[],
      booleanFields:[],
      primaryKey:'',
      multiRow:false,
      sliceSize:0, // No paging
      primaryFetch:true,
      notLoggedIn:false,
      autoEdit:false,
      doNotPreventNav:false,
      saveCleanFields:false,
      questionnaire:null
      },options)

    // Paging setup
    scope.currentPage=1
    scope.totalItems=1000000 // May be adjusted downwards when we know how many there are
    scope.itemsPerPage=scope.FormSvcOptions.sliceSize
    
    scope.classes={label:'col-sm-4', data:'col-sm-8'} // Bootstrap widths of form label and data
    
    // Date picker setup
    scope.dateFormat='dd/MM/yyyy'  
    scope.dateOptions={}
    scope.dateIsOpen={}
    scope.dateOpen = function(event,sID,shiftLeft) {
      event.preventDefault()
      event.stopPropagation()
      scope.dateIsOpen[sID] = true
      if (shiftLeft) {
        $timeout(svc.shiftDatePopupLeft,0,true,sID,shiftLeft)
        }
      }
    scope.dateClose = function(sID) {
      scope.dateIsOpen[sID]=false
      }
      
    scope.autoEdit=scope.FormSvcOptions.autoEdit
    ApplicationSvc.preventNavIfEditing=!scope.FormSvcOptions.doNotPreventNav && !scope.FormSvcOptions.autoEdit
    
    // Attach the key functions to the scope for easy use by the form
    scope.update=function () {
      return svc.update(scope)
	    }
     
    scope.reset=function () {
      return svc.reset(scope)
      }

    scope.fetch=function (options) {
      return svc.fetch(scope,options)
      }
      
    scope.exec=function (api,postObject) {
      return ApiSvc.exec(scope,api,postObject,scope.FormSvcOptions.notLoggedIn)
	    }
      
    scope.save=function () {
      // Submit method on MiniForm - must be over-ridden in controller if needed
	    }
      
    scope.setEditing=function (bOn) {
      svc.setEditing(scope,bOn)
      }

    scope.setSubmitted=function (bOn) {
      svc.setSubmitted(scope,bOn)
      }
      
    scope.back=function () {
      $window.history.back()
      }
      
    scope.home=function () {
      $location.url('/')
      }
      
    if (scope.FormSvcOptions.questionnaire) {
      scope.FormSvcOptions.questionnaire.notLoggedIn=scope.FormSvcOptions.notLoggedIn
      QuestionnaireSvc.setOptions(scope,scope.FormSvcOptions.questionnaire)
      }

    }
   
  svc.shiftDatePopupLeft=function(sID,px) {
    var el=document.getElementById(sID)
    if (el) {
      var sc=angular.element(el).isolateScope()
      if (sc && sc.position) {
        sc.position.left=0-px
        }
      }
    }
   
  svc.setEditing=function (scope,bOn) {
    if (bOn === undefined) {bOn=true}
    scope.isEditing=bOn
    ApplicationSvc.isEditing=bOn
    scope.$broadcast('isEditing',bOn)
    if (bOn && scope.QuestionnaireSvcOptions) {
      QuestionnaireSvc.linkFormFields(scope)
      }
    }

  svc.setSubmitted=function (scope,bOn) {
    if (bOn === undefined) {bOn=true}
    scope.isSubmitted=bOn
    scope.$broadcast('isSubmitted',bOn)
    }
      
  svc.update=function (scope, bSaveOnly, bNoValidate) {
      scope.formError=''
      if (!scope.isEditing) {return $q.when()}  // Returns a resolved promise so that it can be 'then'ed
      if (!scope.FormSvcOptions.saveAPI) {return $q.reject(scope.formError='No saveAPI in form service options')}
      svc.setSubmitted(scope,true)
      if (scope.theForm.$valid || bNoValidate) {
        var changes=false
        var postvars={}
        angular.forEach(scope.theRecord, function (value,key) {
          if (scope.FormSvcOptions.saveCleanFields || key == scope.FormSvcOptions.primaryKey || !ApiSvc.ValuesAreEqual(value,scope.cleanRecord[key])) {
            postvars[scope.FormSvcOptions.savePrefix + key]=value
            if (key != scope.FormSvcOptions.primaryKey) {changes=true}
            }
          })
        if (scope.QuestionnaireSvcOptions) {
          var qanswers=QuestionnaireSvc.answers(scope)
          if (qanswers) {
            if (!scope.QuestionnaireSvcOptions.postVar) {return $q.reject(scope.formError='No postVar in questionnaire service options')}
            postvars[scope.QuestionnaireSvcOptions.postVar]=qanswers
            changes=true
            }
          }
        if (!changes) {
          if (bSaveOnly) {return $q.when()}
          return svc.fetch(scope)
          }
        return ApiSvc.exec(scope,scope.FormSvcOptions.saveAPI,postvars,scope.FormSvcOptions.notLoggedIn)
          .then(function (res) {
            if (bSaveOnly) {return $q.when(res)} // In this case only we pass out the IQXResult from the exec
            return svc.fetch(scope)
            })
      } else {
        return $q.reject(scope.formError='There are invalid values on the form')
        }
	   }
     
  svc.reset=function(scope) {
    if (scope.cleanRecord) {
      scope.theRecord=angular.copy(scope.cleanRecord)
      }
    if (scope.QuestionnaireSvcOptions) {
      QuestionnaireSvc.reset(scope)
      }
    if (scope.theForm != undefined)  {
      scope.theForm.$setPristine()
      scope.theForm.$setUntouched()
      }
    svc.setEditing(scope,false)
    svc.setSubmitted(scope,false)
	  scope.formError=''
    }

	svc.fetch=function (scope,options) {
    var theResult
    options = options || scope.FormSvcOptions 
    if (!options.primaryFetch) {
      return ApiSvc.fetch(scope,options)
    }
    if (scope.theForm != undefined)  {
      scope.theForm.$setPristine()
      scope.theForm.$setUntouched()
      } 
    svc.setEditing(scope,false)
    svc.setSubmitted(scope,false)
	  scope.formError=''
    return ApiSvc.fetch(scope,options)
      .then(function () {
        if (scope.theRecord) {
          scope.cleanRecord=angular.copy(scope.theRecord)
          } // Note: The questionnaire service handles its own clean record storage
				})
      .then(function () {
        if (scope.QuestionnaireSvcOptions) {
          return QuestionnaireSvc.fetch(scope)
          }
				})
      .then(function () {
        if (options.autoEdit) {
          return $timeout(scope.setEditing,0,true,true)  // Wrap in timeout to ensure DOM is built and ready first
          }
        })
		}
    
  svc.unSpliceSelectList=function(sList) {
    var ar=sList.split(/\]\~\[/)
    var rv=[],d,v
    while (ar.length>1) {
      d=ar.shift()
      v=ar.shift()
      rv.push({Descrip:d,Value:v})
      }
    return rv
    }
    
  svc.arrayTotal=function(ar,fld) {
    var rv=0
    angular.forEach(ar,function(it){
      if (isFinite(it[fld])) {
        rv+=parseFloat(it[fld])
        }
      })
    return rv
    }
    
  svc.modalChoose=function(caption,xHtml,choices,size) {
    var html='<div class="modal-header">'
    html+='<h3 class="modal-title">'+caption+'</h3>'
    html+='</div>'
    html+='<div class="modal-body">'+xHtml
    angular.forEach(choices, function(choice,ix) {
      var xclass='btn btn-block btn-'
      if (angular.isString(choice)){
        xclass+='primary'
      } else {
        xclass+=choice.type
        choice=choice.description
      }
      html+='<button ng-click="$close('+ix+')" class="'+xclass+'">'+choice+'</button>'
      })
    html+='</div>'
    return $uibModal.open({
      template: html,
      size: size || 'sm',
      backdrop: 'static'
      }).result
    }
    
  svc.modalForm=function(scope,id,data,size,classes) {
    var el=document.getElementById(id)   // The form content is defined in a hidden div with the specified id
    var html=angular.element(el).html()  // The div must have the ng-non-bindable directive
    data=data || {}                      // Initial form data may be specified or omitted
    classes=classes || scope.classes
    return $uibModal.open({
      template: html,
      size: size || 'sm',
      backdrop: 'static',
      controller:'ModalFormCtrl',
      scope:scope,   // Specify the parent scope of the dialog's scope
      resolve: {
        getData: function() {
          return {theRecord:data, classes:classes}
          }
         }
      }).result
    }

  svc.modalInfo=function(scope,id,data,size) {
    var el=document.getElementById(id)   // The form content is defined in a hidden div with the specified id
    var html=angular.element(el).html()  // The div must have the ng-non-bindable directive
    return $uibModal.open({
      template: html,
      size: size || 'sm',
      backdrop: 'static',
      controller: function($scope) {$scope.data=data},
      scope:scope   // Specify the parent scope of the dialog's scope
      }).result
    }

})

.controller('ModalFormCtrl', function ($scope, getData) {
  $scope.theRecord=getData.theRecord
  $scope.classes=getData.classes
  $scope.formError=''
  $scope.isEditing=true
  $scope.isSubmitted=false
  $scope.save=function () {
    if ($scope.theForm.$valid) {
      $scope.$close($scope.theRecord)
    } else {
      $scope.formError='There are invalid values' 
      $scope.isSubmitted=true
    }
  }
})

