sap.ui.define(
    [
        "com/knpl/dga/complains/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/layout/form/FormElement",
        "sap/m/Input",
        "sap/m/Label",
        "sap/ui/core/library",
        "sap/ui/core/message/Message",
        "sap/m/DatePicker",
        "sap/ui/core/ValueState",
        "com/knpl/dga/complains/controller/Validator",
        "sap/ui/model/type/Date",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/format/DateFormat",
        "sap/ui/core/routing/History",
        "sap/m/Title",
        "com/knpl/dga/complains/model/customInt",
        "com/knpl/dga/complains/model/cmbxDtype2",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        BaseController,
        JSONModel,
        MessageBox,
        MessageToast,
        Fragment,
        FormElement,
        Input,
        Label,
        library,
        Message,
        DatePicker,
        ValueState,
        Validator,
        DateType,
        Filter,
        FilterOperator,
        DateFormat,
        History,
        Title,
        customInt,
        cmbxDtype2
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.dga.complains.controller.AddComplaint",
            {
                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter
                        .getRoute("RouteAddCmp")
                        .attachMatched(this._onRouteMatched, this);
                },
                _onRouteMatched: function (oEvent) {
                    var sId = oEvent.getParameter("arguments").Id;
                    this._initData("add", "", sId);

                    var oViewData = {
                        busy: false,
                        newCustomer: true,
                        LeadCustomer: true,
                        isDGAActive: true,
                        LeadId: "",
                        ConsumerName: "",
                        ConsumerMobileNo: "",
                        NewConsumerName: "",
                        NewConsumerMobileNo: "",
                        Zone: "",
                        LeadStage: 0,
                        ComplaintType: 0,
                        Comments: "",
                        DGA : {
                            PrimaryMobileNo: "",
                            DGAName: "",
                            Zone: "",
                            Division: "",
                            Depot: "",
                            UniqueId: "",
                            DGAID: ""
                        }
                    };

                    var oViewModel = new JSONModel(oViewData);
                    this.getView().setModel(oViewModel, "oViewModel");
                },
                _initData: function (mParMode, mKey, mPainterId) {
                    this._showFormFragment("AddComplaint");
                },

                onRadioButtonSelection: function(oEvent){
                    var oViewModel = this.getView().getModel("oViewModel");
                    var value1 = oViewModel.getProperty("/LeadStage") === 0 ? "ONGOING" : "COMPLETED";
                    var value2 = oViewModel.getProperty("/ComplaintType") + 2;

                    this._issueListFilter(value1, value2);
                },

                onCustomerNameInput:function(oEvent){
                    var sText = oEvent.getParameter("value");
                    if(sText.length > 50 ){
                        oEvent.getSource().setValue(oEvent.getSource().getValue().substring(0, 50));
                    }
                },

                onCustomerNumberInput:function(oEvent){
                    var sText = oEvent.getParameter("value");
                    if(sText.length > 10 ){
                        oEvent.getSource().setValue(oEvent.getSource().getValue().substring(0, 10));
                    }
                },

                _issueListFilter:function(value1, value2){
                    var aFilter = [];
                    aFilter.push( new Filter([
                        new Filter(
                            "LeadStage",
                            FilterOperator.Contains,
                            "NONE"
                        ),
                        new Filter(
                            "LeadStage",
                            FilterOperator.Contains,
                            value1
                        )], false)
                    );
                    aFilter.push(
                        new Filter(
                            "ComplaintTypeId",
                            FilterOperator.EQ,
                            value2
                        )
                    );

                    var oList = this.getView().byId("idList");
                    oList.getBinding("items").filter(aFilter);
                },
                onCustomerValueHelpRequest: function (oEvent) {
                    var sInputValue = oEvent.getSource().getValue(),
                        oView = this.getView();

                    if (!this._pValueHelpDialog) {
                        this._pValueHelpDialog = Fragment.load({
                            id: oView.getId(),
                            name:
                                "com.knpl.dga.complains.view.fragments.CustomerValueHelpDialog",
                            controller: this,
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }
                    this._pValueHelpDialog.then(function (oDialog) {
                        // Create a filter for the binding
                        oDialog
                            .getBinding("items")
                            .filter([
                                new Filter(
                                    [
                                        new Filter(
                                            {
                                                path: "ConsumerName",
                                                operator: "Contains",
                                                value1: sInputValue.trim(),
                                                caseSensitive: false
                                            }
                                        ),
                                        new Filter(
                                            {
                                                path: "PrimaryNum",
                                                operator: "Contains",
                                                value1: sInputValue.trim(),
                                                caseSensitive: false
                                            }
                                        )
                                    ],
                                    false
                                ),
                            ]);
                        // Open ValueHelpDialog filtered by the input's value
                        oDialog.open(sInputValue);
                    });
                },
                onCustomerValueHelpSearch: function (oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oFilter = new Filter(
                        [
                            new Filter(
                                {
                                    path: "ConsumerName",
                                    operator: "Contains",
                                    value1: sValue.trim(),
                                    caseSensitive: false
                                }
                            ),
                            new Filter(
                                {
                                    path: "PrimaryNum",
                                    operator: "Contains",
                                    value1: sValue.trim(),
                                    caseSensitive: false
                                }
                            )
                        ],
                        false
                    );

                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                onCustomerValueHelpClose: function (oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    oEvent.getSource().getBinding("items").filter([]);
                    var oModelControl = this.getView().getModel("oViewModel")  ;
                    if (!oSelectedItem) {
                        return;
                    }
                    var obj = oSelectedItem.getBindingContext().getObject();
                    oModelControl.setProperty("/ConsumerName",obj.ConsumerName );
                    oModelControl.setProperty("/ConsumerMobileNo",obj.PrimaryNum );
                    oModelControl.setProperty("/Zone",obj.Zone );
                    oModelControl.setProperty("/LeadId",obj.Id );

                    switch(obj.LeadStatusId){
                        case 1 : oModelControl.setProperty("/LeadStage",0); break;
                        case 2 : oModelControl.setProperty("/LeadStage",0); break;
                        case 3 : oModelControl.setProperty("/LeadStage",1); break;
                        case 4 : oModelControl.setProperty("/LeadStage",1); break;
                        case 5 : oModelControl.setProperty("/LeadStage",0); break;
                        case 6 : oModelControl.setProperty("/LeadStage",1); break;
                        default : oModelControl.setProperty("/LeadStage",1);
                    }

                    if(obj.DGAId === null){
                        // MessageBox.information("Kindly assign DGA for selected Lead.");
                        var DGA = {
                            PrimaryMobileNo: "",
                            DGAName: "",
                            Zone: "",
                            Division: "",
                            Depot: "",
                            UniqueId: "",
                            DGAID: ""
                        };
                        oModelControl.setProperty("/DGA",DGA);
                        oModelControl.setProperty("/isDGAActive",true);
                    } else {
                        oModelControl.setProperty("/isDGAActive",false);
                        this._fetchDGA(Number(obj.DGAId)).then(function(oData){
                            oModelControl.setProperty("/DGA/DGAName",oData.GivenName );
                            oModelControl.setProperty("/DGA/PrimaryMobileNo",oData.Mobile );
                            oModelControl.setProperty("/DGA/Zone",oData.Zone );
                            oModelControl.setProperty("/DGA/Division",oData.DivisionId );
                            oModelControl.setProperty("/DGA/Depot",oData.DepotId );
                            oModelControl.setProperty("/DGA/DGAID",oData.Id );
                        });
                    }

                    oModelControl.setProperty("/newCustomer",false );
                    oModelControl.setProperty("/LeadCustomer",true );
                },
                _fetchDGA:function(id){
                    var promise = jQuery.Deferred();
                    var oData = this.getView().getModel();
                    oData.read("/DGAs("+id+"L)", {
                        success: function (oData) {
                            promise.resolve(oData);
                        },
                        error: function (a) {
                            MessageBox.error(
                                "Unable to fetch a DGAs due to the server issues",
                                {
                                    title: "Error Code: " + a.statusCode,
                                }
                            );
                            promise.reject(a);
                        },
                    });
                    return promise;
                },
                onCustomerInputChange:function(oEvent){
                    if(oEvent.getSource().getValue()){
                        this.getView().getModel("oViewModel").setProperty("/newCustomer",false );
                        this.getView().getModel("oViewModel").setProperty("/LeadCustomer",true );
                        this.getView().getModel("oViewModel").setProperty("/isDGAActive",false);
                    } else {
                        // Removing values of DGA
                        var DGA = {
                            PrimaryMobileNo: "",
                            DGAName: "",
                            Zone: "",
                            Division: "",
                            Depot: "",
                            UniqueId: "",
                            DGAID: ""
                        };
                        this.getView().getModel("oViewModel").setProperty("/DGA",DGA);
                        this.getView().getModel("oViewModel").setProperty("/newCustomer",true );
                        this.getView().getModel("oViewModel").setProperty("/LeadCustomer",true );
                        this.getView().getModel("oViewModel").setProperty("/isDGAActive",true);
                        this.getView().getModel("oViewModel").setProperty("/ConsumerMobileNo","" );
                        this.getView().getModel("oViewModel").setProperty("/Zone","" );
                        this.getView().getModel("oViewModel").setProperty("/NewConsumerName","" );
                        this.getView().getModel("oViewModel").setProperty("/NewConsumerMobileNo","" );
                    }
                },
                onNewCustomerInputChange:function(oEvent){
                    if(oEvent.getSource().getValue()){
                        this.getView().getModel("oViewModel").setProperty("/newCustomer",true );
                        this.getView().getModel("oViewModel").setProperty("/LeadCustomer",false );
                        this.getView().getModel("oViewModel").setProperty("/isDGAActive",true);
                        this.getView().getModel("oViewModel").setProperty("/LeadStage",1);
                        // Removing values of DGA
                        var DGA = {
                            PrimaryMobileNo: "",
                            DGAName: "",
                            Zone: "",
                            Division: "",
                            Depot: "",
                            UniqueId: "",
                            DGAID: ""
                        };
                        this.getView().getModel("oViewModel").setProperty("/DGA",DGA);
                    } else {
                        this.getView().getModel("oViewModel").setProperty("/newCustomer",true );
                        this.getView().getModel("oViewModel").setProperty("/LeadCustomer",true );
                        this.getView().getModel("oViewModel").setProperty("/isDGAActive",false);
                        this.getView().getModel("oViewModel").setProperty("/ConsumerMobileNo","" );
                        this.getView().getModel("oViewModel").setProperty("/Zone","" );
                        this.getView().getModel("oViewModel").setProperty("/ConsumerName","" );
                    }
                },
                onDGAValueHelpRequest: function (oEvent) {
                    var sInputValue = oEvent.getSource().getValue(),
                        oView = this.getView(),
                        oViewModel = this.getView().getModel("oViewModel");

                    if (!this._ValueHelpDialog) {
                        this._ValueHelpDialog = Fragment.load({
                            id: oView.getId(),
                            name:
                                "com.knpl.dga.complains.view.fragments.DGAValueHelpDialog",
                            controller: this,
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }
                    this._ValueHelpDialog.then(function (oDialog) {
                        // Create a filter for the binding
                        oDialog
                            .getBinding("items")
                            .filter([
                                new Filter(
                                    [
                                        new Filter(
                                            {
                                                path: "GivenName",
                                                operator: "Contains",
                                                value1: sInputValue.trim(),
                                                caseSensitive: false
                                            }
                                        ),
                                        new Filter(
                                            [
                                                new Filter(
                                                    {
                                                        path: "IsArchived",
                                                        operator: "EQ",
                                                        value1: false,
                                                        caseSensitive: false
                                                    }
                                                ),
                                                new Filter(
                                                    {
                                                        path: "Zone",
                                                        operator: "Contains",
                                                        value1: oViewModel.getProperty("/Zone"),
                                                        caseSensitive: false
                                                    }
                                                )
                                            ],
                                            false
                                        )
                                    ],
                                    false
                                ),
                            ]);
                        // Open ValueHelpDialog filtered by the input's value
                        oDialog.open(sInputValue);
                    });
                },
                onDGAValueHelpSearch: function (oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oFilter = new Filter(
                        [
                            new Filter(
                                {
                                    path: "GivenName",
                                    operator: "Contains",
                                    value1: sValue.trim(),
                                    caseSensitive: false
                                }
                            ),
                            new Filter(
                                {
                                    path: "Mobile",
                                    operator: "Contains",
                                    value1: sValue.trim(),
                                    caseSensitive: false
                                }
                            )
                        ],
                        false
                    );

                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                onDGAValueHelpClose: function (oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    oEvent.getSource().getBinding("items").filter([]);
                    var oModelControl = this.getView().getModel("oViewModel")  ;
                    if (!oSelectedItem) {
                        return;
                    }
                    var obj = oSelectedItem.getBindingContext().getObject();
                   
                    oModelControl.setProperty("/DGA/DGAName",obj.GivenName );
                    oModelControl.setProperty("/DGA/PrimaryMobileNo",obj.Mobile );
                    oModelControl.setProperty("/DGA/Zone",obj.Zone );
                    oModelControl.setProperty("/DGA/Division",obj.DivisionId );
                    oModelControl.setProperty("/DGA/Depot",obj.DepotId );
                    oModelControl.setProperty("/DGA/DGAID",obj.Id );
                },
                onPressSave: function () {
                    var oModel = this.getView().getModel("oViewModel");
                    var oValidator = new Validator();
                    var oVbox = this.getView().byId("idVbx");
                    var bValidation = oValidator.validate(oVbox, true);

                    if (bValidation && this.getView().byId("idList").getSelectedItems().length === 0) {
                        MessageToast.show(
                            "Kindly input all the mandatory(*) fields to continue."
                        );
                    } else {
                        this._postDataToSave(oModel.getProperty("/newCustomer"));
                    }
                },

                _postDataToSave: function (isNewCustomer) {
                    var oView = this.getView();
                    var oViewModel = oView.getModel("oViewModel");
                    if(isNewCustomer){
                        var oPayLoad = {
                            "LeadStage": oViewModel.getProperty("/LeadStage") === 0 ? "ONGOING" : "COMPLETED",
                            "ComplaintTypeId": oViewModel.getProperty("/ComplaintType") + 2,
                            "Comments": oViewModel.getProperty("/Comments") ? oViewModel.getProperty("/Comments") : null,
                            "ConsumersSelectedIssuesRequests": this._selectedItemList(this.getView().byId("idList").getSelectedItems()),
                            "IsNewConsumer": oViewModel.getProperty("/newCustomer"),
                            "ConsumerName": oViewModel.getProperty("/newCustomer") ? oViewModel.getProperty("/NewConsumerName") : null,
                            "ConsumerMobileNo": oViewModel.getProperty("/newCustomer") ? oViewModel.getProperty("/NewConsumerMobileNo") : null,
                            "DGAId": oViewModel.getProperty("/DGA/DGAID")
                        };
                    }
                    else {
                        var oPayLoad = {
                            "LeadId": oViewModel.getProperty("/LeadId"),
                            "LeadStage": oViewModel.getProperty("/LeadStage") === 0 ? "ONGOING" : "COMPLETED",
                            "ComplaintTypeId": oViewModel.getProperty("/ComplaintType") + 2,
                            "Comments": oViewModel.getProperty("/Comments") ? oViewModel.getProperty("/Comments") : null,
                            "ConsumersSelectedIssuesRequests": this._selectedItemList(this.getView().byId("idList").getSelectedItems()),
                            "IsNewConsumer": oViewModel.getProperty("/newCustomer"),
                            "ConsumerName": oViewModel.getProperty("/newCustomer") ? oViewModel.getProperty("/NewConsumerName") : null,
                            "ConsumerMobileNo": oViewModel.getProperty("/newCustomer") ? oViewModel.getProperty("/NewConsumerMobileNo") : null,
                            "DGAId": oViewModel.getProperty("/DGA/DGAID")
                        };
                    }
                    
                    this._postCreateData(oPayLoad);

                    // c1.then(function (oData) {
                    //     othat.navPressBack();
                    // });
                },
                _postCreateData: function (oPayLoad) {
                    var promise = jQuery.Deferred();
                    var oData = this.getView().getModel(), othat = this;
                    oData.create("/Complaints", oPayLoad, {
                        success: function (oData) {
                            // MessageToast.show("Complaint Successfully Created");
                            var path = "Complaints(" +oData.Id+ ")" 
                            MessageBox.success("Complaint Successfully Created.", {
                                title: "Success",
                                onClose: function(){
                                    othat.navPressBack();
                                }
                            });
                            promise.resolve(oData);
                        },
                        error: function (a) {
                            MessageBox.error(
                                "Unable to create a complaint due to the server issues",
                                {
                                    title: "Error Code: " + a.statusCode,
                                }
                            );
                            promise.reject(a);
                        },
                    });
                    return promise;
                },
                // Selected list item compose for payload 
                _selectedItemList:function(oListItems){
                    return oListItems.map(function(o){ return {
                        ComplaintTypeId: o.getBindingContext().getObject("ComplaintTypeId"),
                        ComplaintSubtypeId: o.getBindingContext().getObject("Id")
                    }});
                },
                navPressBack: function () {
                    var oHistory = History.getInstance();
                    var sPreviousHash = oHistory.getPreviousHash();

                    if (sPreviousHash !== undefined) {
                        window.history.go(-1);
                    } else {
                        var oRouter = this.getOwnerComponent().getRouter();
                        oRouter.navTo("worklist", {}, true);
                    }
                },
                _showFormFragment: function (sFragmentName) {
                    var objSection = this.getView().byId("oVbxSmtTbl");
                    var oView = this.getView();
                    objSection.destroyItems();
                    var othat = this;
                    this._getFormFragment(sFragmentName).then(function (oVBox) {
                        oView.addDependent(oVBox);
                        objSection.addItem(oVBox);
                        othat._issueListFilter("ONGOING", 2);
                    });
                },
                _getFormFragment: function (sFragmentName) {
                    var oView = this.getView();
                    var othat = this;
                    // if (!this._formFragments) {
                    this._formFragments = Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.dga.complains.view.fragments." + sFragmentName,
                        controller: othat,
                    }).then(function (oFragament) {
                        return oFragament;
                    });
                    // }

                    return this._formFragments;
                },
            }
        );
    }
);
