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
        "sap/m/MessageToast",
        "../model/customMulti"
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
        MessageToast,
        customMulti
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.dga.payrollcompany.controller.Worklist", {
            formatter: formatter,
            customMulti:customMulti,

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
                    AddFields: {
                        Name: "",
                        MultiCombo: {
                            Zone: [],
                            Division: []
                        }
                    },
                    EditFields: {
                        Id: "",
                        Name: "",
                        MultiCombo: {
                            Zone: [],
                            Division: []
                        }
                    },
                    filterBar: {
                        Search: "",
                        ZoneId: "",
                        DivisionId: ""
                    },
                    PageBusy: false
                };
                var oMdlCtrl = new JSONModel(oDataControl);
                this.getView().setModel(oMdlCtrl, "oModelControl");
                var startupParams;
                if (this.getOwnerComponent().getComponentData()) {
                    startupParams = this.getOwnerComponent().getComponentData().startupParameters;
                }
                // console.log(startupParams);
                if (startupParams) {
                    if (startupParams.hasOwnProperty("DgaId")) {
                        if (startupParams["DgaId"].length > 0) {
                            this._onNavToDetails(startupParams["DgaId"][0]);
                        }
                    }
                }

                oRouter
                    .getRoute("worklist")
                    .attachMatched(this._onRouteMatched, this);
            },
            _onRouteMatched: function () {
                this._InitData();
                // this._addSearchFieldAssociationToFB();
            },
            _ResetFilterBar: function () {
                var aCurrentFilterValues = [];
                var aResetProp = {
                    Search: "",
                    ZoneId: "",
                    DivisionId: ""
                };
                var oViewModel = this.getView().getModel("oModelControl");
                oViewModel.setProperty("/filterBar", aResetProp);
                var oTable = this.getView().byId("idWorkListTable1");
                oTable.rebindTable();
            },
            _CreateFilter: function () {
                var aCurrentFilterValues = [];
                var oViewFilter = this.getView()
                    .getModel("oModelControl")
                    .getProperty("/filterBar");

                var aFlaEmpty = false;
                // init filters - is archived and complaint type id is 1
                aCurrentFilterValues.push(
                    new Filter("IsArchived", FilterOperator.EQ, false));


                // filter bar filters
                for (let prop in oViewFilter) {
                    if (oViewFilter[prop]) {
                        if (prop === "ZoneId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("PayRollCompanyZone/ZoneId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "DivisionId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("PayRollCompanyDivision/DivisionId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "Search") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter(
                                    [
                                        new Filter({
                                            path: "Name",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        })
                                    ],
                                    false
                                )
                            );
                        }
                    }
                }

                var endFilter = new Filter({
                    filters: aCurrentFilterValues,
                    and: true,
                });
                if (!aFlaEmpty) {
                    return endFilter;
                } else {
                    return false;
                }
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
                        c3 = othat._initTableData();
                        c3.then(function () {
                            oModelControl.setProperty("/PageBusy", false)
                        })
                    })
                })

            },
            _initTableData: function () {
                /*
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: Used to load the table data and trigger the on before binding method.
                 */
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                if (oView.byId("idWorkListTable1")) {
                    oView.byId("idWorkListTable1").rebindTable();
                }
                promise.resolve();
                return promise;
            },
            onPressAddObject: function () {
                var oView = this.getView();
                return new Promise(function (resolve, reject) {
                    if (!this._AddNewPayrollCompany) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.dga.payrollcompany.view.fragments.AddNewPayrollCompany",
                            controller: this,
                        }).then(
                            function (oDialog) {
                                this._AddNewPayrollCompany = oDialog;
                                oView.addDependent(this._AddNewPayrollCompany);
                                this._AddNewPayrollCompany.open();
                                resolve();
                            }.bind(this)
                        );
                    } else {
                        this._AddNewPayrollCompany.open();
                        resolve();
                    }
                }.bind(this));
            },
            onPressEditObject: function (oEvent) {
                var oView = this.getView();
                var oContext = oEvent.getSource().getBindingContext();
                var contextObject = {};
                jQuery.extend(true, contextObject, oContext.getObject());
                oView.getModel("oModelControl").setProperty("/EditFields/Name", contextObject.Name);
                oView.getModel("oModelControl").setProperty("/EditFields/Id", contextObject.Id);
                oView.getModel("oModelControl").setProperty("/EditFields/MultiCombo/Zone", this._ZoneDivisionDataFmt(oContext.getObject("PayRollCompanyZone"), "ZoneId"));
                oView.getModel("oModelControl").setProperty("/EditFields/MultiCombo/Division", this._ZoneDivisionDataFmt(oContext.getObject("PayRollCompanyDivision"), "DivisionId"));
                return new Promise(function (resolve, reject) {
                    if (!this._EditPayrollCompany) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.dga.payrollcompany.view.fragments.EditPayrollCompany",
                            controller: this,
                        }).then(
                            function (oDialog) {
                                this._EditPayrollCompany = oDialog;
                                oView.addDependent(this._EditPayrollCompany);
                                this._EditPayrollCompany.open();
                                resolve();
                            }.bind(this)
                        );
                    } else {
                        this._EditPayrollCompany.open();
                        resolve();
                    }
                }.bind(this));
            },
            _ZoneDivisionDataFmt:function(aValue, mParam){
                var oModel = this.getView().getModel();
                return aValue.map(function(o){
                    return oModel.getProperty("/" + o + "/" + mParam);
                });
            },
            onPayrollCompanyDialogCancel: function () {
                if(this._AddNewPayrollCompany){
                    this.getView().getModel("oModelControl").setProperty("/AddFields", {
                        Id: "",
                        Name: "",
                        MultiCombo: {
                            Zone: [],
                            Division: []
                        }
                    });
                    this._AddNewPayrollCompany.close();
                }
                if(this._EditPayrollCompany){
                    this.getView().getModel("oModelControl").setProperty("/EditFields", {
                        Id: "",
                        Name: "",
                        MultiCombo: {
                            Zone: [],
                            Division: []
                        }
                    });
                    this._EditPayrollCompany.close();
                }

            },
            onPayrollCompanyDialogAdd: function(){
                var oView = this.getView();
                var oDataModel = this.getView().getModel();
                var oModelContrl = oView.getModel("oModelControl");

                var othat = this;

                if(oModelContrl.getProperty("/AddFields/Name").length === 0 || 
                    oModelContrl.getProperty("/AddFields/MultiCombo/Zone").length === 0 ||
                    oModelContrl.getProperty("/AddFields/MultiCombo/Division").length === 0){
                    MessageToast.show("Kindly Fill All the mandatory Fields.");
                    return;
                }

                var c1 = this._postCreateData(oModelContrl.getProperty("/AddFields"));

                c1.then(function (oData) {
                    othat.onPayrollCompanyDialogCancel();
                    oDataModel.refresh(true);
                });
            },
            onCompanyNameInput:function(oEvent){
                var sText = oEvent.getParameter("value");
                if(sText.length > 1000 ){
                    oEvent.getSource().setValue(oEvent.getSource().getValue().substring(0, 100));
                }
            },
            _postCreateData: function (oPayLoad) {
                var promise = jQuery.Deferred();
                var oDataModel = this.getView().getModel();
                var oModelControl = this.getView().getModel("oModelControl");
                oPayLoad = {
                    Id: oPayLoad.Id,
                    Name: oPayLoad.Name,
                    PayRollCompanyZone: this._multiSelectDataForm(oModelControl.getProperty("/AddFields/MultiCombo/Zone"), "Zone"),
                    PayRollCompanyDivision: this._multiSelectDataForm(oModelControl.getProperty("/AddFields/MultiCombo/Division", "Division"))
                };
                
                oDataModel.create("/MasterPayrollCompanies", oPayLoad, {
                    success: function (oData) {
                        MessageToast.show("Payroll Company Successfully Created");
                        oModelControl.setProperty("/AddFields", {
                            Id: "",
                            Name: "",
                            MultiCombo: {
                                Zone: [],
                                Division: []
                            }
                        });
                        promise.resolve(oData);
                        //othat.navPressBack();
                    },
                    error: function (a) {
                        MessageBox.error(
                            "Unable to create a Payroll Company due to the server issues",
                            {
                                title: "Error Code: " + a.statusCode,
                            }
                        );
                        promise.reject(a);
                    },
                });
                return promise;
            },
            onPayrollCompanyDialogSave: function(oEvent){
                var oView = this.getView(), oThat=this;
                var oData = oView.getModel();
                var oModel = oView.getModel("oModelControl");

                if(oModel.getProperty("/EditFields/Name").length === 0 || 
                    oModel.getProperty("/EditFields/MultiCombo/Zone").length === 0 ||
                    oModel.getProperty("/EditFields/MultiCombo/Division").length === 0){
                    MessageToast.show("Kindly Fill All the mandatory Fields.");
                    return;
                }

                var oPayload = {
                    Id:oModel.getProperty("/EditFields/Id"),
                    Name:oModel.getProperty("/EditFields/Name"),
                    PayRollCompanyZone: this._multiSelectDataForm(oModel.getProperty("/EditFields/MultiCombo/Zone"), "Zone"),
                    PayRollCompanyDivision: this._multiSelectDataForm(oModel.getProperty("/EditFields/MultiCombo/Division", "Division"))
                };
                
                var othat = this;
                oData.update("/MasterPayrollCompanies("+Number(oModel.getProperty("/EditFields/Id"))+")", oPayload, {
                    success: function () {
                        oModel.setProperty("/EditFields", {
                            Id: "",
                            Name: "",
                            MultiCombo: {
                                Zone: [],
                                Division: []
                            }
                        });
                           oData.refresh(true);
                        MessageToast.show("Payroll Company Successfully Updated.");
                        othat.onPayrollCompanyDialogCancel();
                    },
                    error: function (a) {
                        MessageBox.error(othat._sErrorText, {
                            title: "Error Code: " + a.statusCode,
                        });
                    },
                });
            },
            _multiSelectDataForm: function(aValue, mParam){
                if(mParam === "Zone"){
                    return aValue.map(function(a){
                        return { ZoneId: a };
                    });
                }
                else {
                    return aValue.map(function(a){
                        return { DivisionId: a };
                    });
                }
                
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
                        search: othat.onFilterBarSearch.bind(othat)
                    });
                    oFilterBar.setBasicSearch(oBasicSearch);
                }
                promise.resolve();
                return promise;

            },
            
            _fnChangeDivDepot: function (oChgdetl) {
                var aTarget = this.getModel("oModelControl").getProperty(oChgdetl.target.localPath),
                    aNewTarget = [];
                var aSource = this.getModel("oModelControl").getProperty(oChgdetl.src.path),
                    oSourceSet = new Set(aSource);
                var oModel = this.getModel(),
                    tempPath, tempdata;
                aTarget.forEach(function (ele) {
                    if (typeof ele === "string") {
                        tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                            Id: ele
                        });
                    }
                    tempdata = oModel.getData(tempPath);
                    if (oSourceSet.has(tempdata[oChgdetl.target.key])) {
                        aNewTarget.push(ele)
                    }
                });
                this.getModel("oModelControl").setProperty(oChgdetl.target.localPath, aNewTarget);
    
            },
    
            onMultyZoneChange: function (oEvent) {
                var sKeys = oEvent.getSource().getSelectedKeys();
                var oDivision = this.getView().byId("idDivisionCreate");
                if(sKeys.length === 0){
                    this.getView().getModel("oModelControl").setProperty("/AddFields/MultiCombo/Zone", []);
                }
                this._fnChangeDivDepot({
                    src: {
                        path: "/AddFields/MultiCombo/Zone"
                    },
                    target: {
                        localPath: "/AddFields/MultiCombo/Division",
                        oDataPath: "/MasterDivisions",
                        key: "Zone"
                    }
                });
    
                var aDivFilter = [];
                for (var y of sKeys) {
                    aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y))
                }
                oDivision.getBinding("items").filter(aDivFilter);
            },
            onMultyZoneChange2: function (oEvent) {
                var sKeys = oEvent.getSource().getSelectedKeys();
                var oDivision = this.getView().byId("idDivisionEdit");
                if(sKeys.length === 0){
                    this.getView().getModel("oModelControl").setProperty("/EditFields/MultiCombo/Zone", []);
                }
                this._fnChangeDivDepot({
                    src: {
                        path: "/EditFields/MultiCombo/Zone"
                    },
                    target: {
                        localPath: "/EditFields/MultiCombo/Division",
                        oDataPath: "/MasterDivisions",
                        key: "Zone"
                    }
                });
    
                var aDivFilter = [];
                for (var y of sKeys) {
                    aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y))
                }
                oDivision.getBinding("items").filter(aDivFilter);
            },

            // onFilterBarSearch: function () {
            //     var filters = [];
            //     var query = this.getView().byId("filterbar").getBasicSearchValue();
            //     if (query && query.length > 0) {
            //         var nameFilter = new sap.ui.model.Filter({
            //             path: "Name",
            //             operator: "Contains",
            //             value1: query.trim(),
            //             caseSensitive: false
            //         });

            //         filters.push(nameFilter);
            //     }

            //     var list = this.getView().byId("idPayrollTable");
            //     var binding = list.getBinding("items");
            //     binding.filter(filters);
            // },
            // onResetFilterBar: function () {
            //     var oList = this.getView().byId("idPayrollTable");
            //     var oBinding = oList.getBinding("items");
            //     oBinding.filter([]);

            // },
            onResetFilterBar: function () {
                this._ResetFilterBar();
            },
            onBindTblPayrollCompanyList: function (oEvent) {
                /*
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: init binding method for the table.
                 */
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["select"] = "Id,Name,UpdatedAt,CreatedAt,PayRollCompanyZone,PayRollCompanyDivision"
                oBindingParams.parameters["expand"] = "PayRollCompanyZone,PayRollCompanyDivision";
                oBindingParams.sorter.push(new Sorter("CreatedAt", true));

                // Apply Filters
                var oFilter = this._CreateFilter();
                if (oFilter) {
                    oBindingParams.filters.push(oFilter);
                }
            },
            onFilterBarSearch: function () {
                var oView = this.getView();
                oView.byId("idWorkListTable1").rebindTable();
            },
        }
        );
    }
);