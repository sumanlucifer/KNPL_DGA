sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "../model/formatter",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/ui/model/Sorter",
        "sap/ui/Device",
        "sap/m/MessageToast"
    ],
    function (
        BaseController,
        JSONModel,
        formatter,
        Filter,
        FilterOperator,
        MessageBox,
        Fragment,
        Sorter,
        Device,
        MessageToast
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.dga.notifications.controller.Worklist", {
                formatter: formatter,

                /* =========================================================== */
                /* lifecycle methods                                           */
                /* =========================================================== */

                /**
                 * Called when the worklist controller is instantiated.
                 * @public
                 */
                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter();
                    var oDataControl = {
                        filterBar: {
                            StartDate: null,
                            EndDate:null,
                            Status: "",
                            Search: "",
                            ZoneId: "",
                            DivisionId: "",
                            DepotId: "",
    
                        },
                        draft:"",
                        scheduled:"",
                        triggered:"",
                        PageBusy: true
                    };
                    var oMdlCtrl = new JSONModel(oDataControl);
                    this.getView().setModel(oMdlCtrl, "oModelControl");
                    oRouter
                        .getRoute("worklist")
                        .attachMatched(this._onRouteMatched, this);


                },
                _ResetFilterBar: function () {
                    var aCurrentFilterValues = [];
                    var aResetProp = {
                        StartDate: null,
                        Status: "",
                        Search: "",
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: "",

                    };
                    var oViewModel = this.getView().getModel("oModelControl");
                    oViewModel.setProperty("/filterBar", aResetProp);
                    var oTable = this.getView().byId("idWorkListTable1");
                    oTable.rebindTable();

                },
                _onRouteMatched: function () {
                    this._InitData();
                },
                onPressAddObject: function () {
                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: Navigation to add object view and controller
                     */
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Add");

                },
                onAdd: function (oEvent) {
                    // this.getModel("appView").setProperty("/viewFlag", "Y");
                    // this.getRouter().navTo("createObject");
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Add", {
                    });
                   
        
                },
              
        
                _InitData: function () {

                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: once the view elements load we have to 
                     * 1. get the logged in users informaion. 2.rebind the table to load data and apply filters 3. perform other operations that are required at the time 
                     * of loading the application
                     */

                    var othat = this;
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var c1, c2, c3, c4;
                    oModelControl.setProperty("/PageBusy", true)
                    c1 = othat._addSearchFieldAssociationToFB();
                    c1.then(function () {
                        c2 = othat._dummyPromise();
                        c2.then(function () {
                            c3 = othat._dummyPromise();
                            c3.then(function () {
                                oModelControl.setProperty("/PageBusy", false)
                            })
                        })
                    })

                },
                _dummyFunction: function () {
                    var promise = jQuerry.Deferred();
                    promise.resolve()
                    return promise;
                },
                _addSearchFieldAssociationToFB: function () {
                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: add the search field in the filter bar in the view.
                     */
                    var promise = jQuery.Deferred();
                    let oFilterBar = this.getView().byId("filterbar");
                    let oSearchField = oFilterBar.getBasicSearch();
                    var oBasicSearch;
                    var othat = this;
                    if (!oSearchField) {
                        // @ts-ignore
                        oBasicSearch = new sap.m.SearchField({
                            value: "{oModelControl>/filterBar/Search}",
                            showSearchButton: true,
                            search: othat.onFilter.bind(othat)
                        });
                        oFilterBar.setBasicSearch(oBasicSearch);
                    }
                    promise.resolve();
                    return promise;

                },
                _getLoggedInInfo: function () {
                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: getting the logged in details of the user
                     */
                    var promise = jQuery.Deferred();
                    var oView = this.getView()
                    var oData = oView.getModel();
                    var oLoginModel = oView.getModel("LoginInfo");
                    var oLoginData = oLoginModel.getData()
                    if (Object.keys(oLoginData).length === 0) {
                        return new Promise((resolve, reject) => {
                            oData.callFunction("/GetLoggedInAdmin", {
                                method: "GET",
                                urlParameters: {
                                    $expand: "UserType",
                                },
                                success: function (data) {
                                    if (data.hasOwnProperty("results")) {
                                        if (data["results"].length > 0) {
                                            oLoginModel.setData(data["results"][0]);
                                        }
                                    }
                                    resolve();
                                },
                            });
                        })
                    } else {
                        promise.resolve();
                        return promise;
                    }

                },
              
                onFilter: function (oEvent) {
                    var aCurrentFilterValues = [];
                    var oViewFilter = this.getView()
                        .getModel("oModelControl")
                        .getProperty("/filterBar");
                    var aFlaEmpty = true;
                    for (let prop in oViewFilter) {
                        if (oViewFilter[prop]) {
                            if (prop === "ZoneId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("ZoneId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "DivisionId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("DivisionId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "StartDate") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "CreatedAt",
                                        FilterOperator.GE,
                                        new Date(oViewFilter[prop])
                                    )
                                );
                            } else if (prop === "EndDate") {
                                aFlaEmpty = false;
                                var oDate = oViewFilter[prop].setDate(oViewFilter[prop].getDate() + 1);
                                aCurrentFilterValues.push(
                                    new Filter("CreatedAt", FilterOperator.LT, oDate)
                                );
                            } else if (prop === "Name") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        [
                                            new Filter({
                                                path: "Name",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter({
                                                path: "MembershipCard",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter({
                                                path: "Mobile",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                        ],
                                        false
                                    )
                                );
                            } else {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        prop,
                                        FilterOperator.Contains,
                                        oViewFilter[prop].trim()
                                    )
                                );
                            }
                        }
                    }

                    var endFilter = new Filter({
                        filters: aCurrentFilterValues,
                        and: true,
                    });
                    //table1
                    var oTable = this.getView().byId("table");
                    var oBinding = oTable.getBinding("items");
                    if (!aFlaEmpty) {
                        oBinding.filter(endFilter);
                    } else {
                        oBinding.filter([]);
                    }
                    //table2
                    var oTable2 = this.getView().byId("table1");
                    var oBinding2 = oTable2.getBinding("items");
                    if (!aFlaEmpty && oBinding2) {
                        oBinding2.filter(endFilter);
                    } else if (aFlaEmpty && oBinding) {
                        oBinding2.filter([]);
                    }
                     //table3
                     var oTable3 = this.getView().byId("table3");
                     var oBinding3 = oTable3.getBinding("items");
                     if (!aFlaEmpty && oBinding3) {
                        oBinding3.filter(endFilter);
                     } else if (aFlaEmpty && oBinding3) {
                         oBinding.filter([]);
                     }
                },


                onResetFilterBar: function () {
                    this._ResetFilterBar();
                },

              
                onListItemPress: function (oEvent) {

                    var oBj = oEvent.getSource().getBindingContext().getObject();
                   
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Detail", {
                        Id: oBj["UUID"],
                        Mode:"Display"
                    });

                },
                onEdit:function(oEvent){
                    var oBj = oEvent.getSource().getBindingContext().getObject();
                   
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Detail", {
                        Id: oBj["UUID"],
                        Mode:"Edit"
                    });
                },
                onUpdateFinished: function (oEvent) {
                    // update the worklist's object counter after the table update
                    var sTitle,sDraft,
                                oTable = this.getView().byId("table"),
                                iTotalItems = oEvent.getParameter("total");
                           // sDraft = this.getResourceBundle().getText("draftCount", [iTotalItems]);
                           // this.getModel("worklistView").setProperty("/draft", sDraft);
                            
                            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                                sDraft = this.getResourceBundle().getText("draftCount", [
                                    iTotalItems,
                                ]);
                            } else {
                                sDraft = this.getResourceBundle().getText("draftCount", [0]);
                            }
                            this.getModel("oModelControl").setProperty("/draft", sDraft);
        
                        
                },
        
                onUpdateFinished1: function (oEvent) {
                    // update the worklist's object counter after the table update
                     var sTitle,sSchedule,
                                oTable = this.getView().byId("table1"),
                                iTotalItems = oEvent.getParameter("total");
                            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                                sSchedule = this.getResourceBundle().getText("scheduledCount", [
                                    iTotalItems,
                                ]);
                            } else {
                                sSchedule = this.getResourceBundle().getText("scheduledCount", [0]);
                            }
                            this.getModel("oModelControl").setProperty("/scheduled", sSchedule);
                },
           
                onUpdateFinished2: function (oEvent) {
                    // update the worklist's object counter after the table update
                     var sTitle,sTrigger,
                                oTable = this.getView().byId("table2"),
                                iTotalItems = oEvent.getParameter("total");
                             if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                                sTrigger = this.getResourceBundle().getText("triggeredCount", [
                                    iTotalItems,
                                ]);
                            } else {
                                sTrigger = this.getResourceBundle().getText("triggeredCount", [0]);
                            }
                            this.getModel("oModelControl").setProperty("/triggered", sTrigger);
                },
        
                onZoneChange: function (oEvent) {
                    var sId = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    // setting value for division
                    var oDivision = oView.byId("idDivision");
                    oDivision.clearSelection();
                    oDivision.setValue("");
                    var oDivItems = oDivision.getBinding("items");
                    oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
                    //setting the data for depot;
                    var oDepot = oView.byId("idDepot");
                    oDepot.clearSelection();
                    oDepot.setValue("");
                    // clearning data for dealer
                },
                onDivisionChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oDepot = oView.byId("idDepot");
                    var oDepBindItems = oDepot.getBinding("items");
                    oDepot.clearSelection();
                    oDepot.setValue("");
                    oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
                },
        
                onPressDelete:function(oEvent){
                    var oView = this.getView();
                    var oBj = oEvent.getSource().getBindingContext().getObject();
                    this._showMessageBox1("information","Message5",[oBj["ComplaintCode"]],
                        this._DeleteComplaints.bind(this,"first paramters","secondParameter")
                   );
                },
                _DeleteComplaints:function(mParam1,mParam2){
                    // after deleting the entity make sure that we are calling the refresh just on the table and not on thw whole model
                   MessageToast.show("Message5")
                },
              
                onEditListItemPress: function (oEvent) {
                    var oBj = oEvent.getSource().getBindingContext().getObject();
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Detail", {
                        Id: oBj["Id"],
                        Mode:"Edit"
                    });

                }
            }
        );
    }
);