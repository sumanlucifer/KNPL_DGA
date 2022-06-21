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
            "com.knpl.dga.payrollcompany.controller.Worklist", {
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
                    AddFields: {
                        Name: ""
                    },
                    EditFields: {},
                    PageBusy: false
                };
                var oMdlCtrl = new JSONModel(oDataControl);
                this.getView().setModel(oMdlCtrl, "oModelControl");

                oRouter
                    .getRoute("worklist")
                    .attachMatched(this._onRouteMatched, this);
            },
            _onRouteMatched: function () {
                // this._InitData();
                this._addSearchFieldAssociationToFB();
            },
            onUpdateFinished: function (oEvent) {
                // update the worklist's object counter after the table update
                var sTitle,
                    oTable = oEvent.getSource(),
                    iTotalItems = oEvent.getParameter("total");
                // only update the counter if the length is final and
                // the table is not empty
                if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                    sTitle = this.getResourceBundle().getText(
                        "PayrollCompanyName",
                        [iTotalItems]
                    );
                    this.getView().byId("idPayrollTableTitle").setText(sTitle+" ("+iTotalItems+")");
                } else {
                    sTitle = this.getResourceBundle().getText(
                        "PayrollCompanyName",
                        [0]
                    );
                    this.getView().byId("idPayrollTableTitle").setText(sTitle +" (0)");
                }
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
                oView.getModel("oModelControl").setProperty("/EditFields", contextObject);
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
            onPayrollCompanyDialogCancel: function () {
                if(this._AddNewPayrollCompany){
                    this.getView().byId("idPayrollCompanyAdd").setValueState("None");
                    this.getView().byId("idPayrollCompanyAdd").setValueStateText("");
                    this.getView().getModel("oModelControl").setProperty("/AddFields", {});
                    this._AddNewPayrollCompany.close();
                }
                if(this._EditPayrollCompany){
                    this.getView().byId("idPayrollCompanyEdit").setValueState("None");
                    this.getView().byId("idPayrollCompanyEdit").setValueStateText("");
                    this.getView().getModel("oModelControl").setProperty("/EditFields", {});
                    this._EditPayrollCompany.close();
                }

            },
            onInputChange:function(oEvent){
                var sText = oEvent.getParameter("value");
                if(sText.length > 50 ){
                    oEvent.getSource().setValue(oEvent.getSource().getValue().substring(0, 50));
                }
            },
            onPayrollCompanyDialogAdd: function(){
                var oView = this.getView();
                var oDataModel = this.getView().getModel();
                var oModelContrl = oView.getModel("oModelControl");

                var othat = this;

                if(oModelContrl.getProperty("/AddFields/Name").length === 0){
                    oView.byId("idPayrollCompanyAdd").setValueState("Error");
                    oView.byId("idPayrollCompanyAdd").setValueStateText("Enter some value");
                    return;
                }

                if(oModelContrl.getProperty("/AddFields/Name").length > 50){
                    oView.byId("idPayrollCompanyAdd").setValueState("Error");
                    oView.byId("idPayrollCompanyAdd").setValueStateText("Name must be within 100 character");
                    return;
                }

                var c1 = this._postCreateData(oModelContrl.getProperty("/AddFields"));

                c1.then(function (oData) {
                    othat.onPayrollCompanyDialogCancel();
                    oDataModel.refresh(true);
                });
            },
            _postCreateData: function (oPayLoad) {
                var promise = jQuery.Deferred();
                var oDataModel = this.getView().getModel();
                var othat = this;
                oDataModel.create("/MasterPayrollCompanies", oPayLoad, {
                    success: function (oData) {
                        MessageToast.show("Payroll Company Successfully Created");
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

                if(oView.byId("idPayrollCompanyEdit").getValue().length === 0){
                    oView.byId("idPayrollCompanyEdit").setValueState("Error");
                    oView.byId("idPayrollCompanyEdit").setValueStateText("Enter some value");
                    return;
                }

                if(oView.byId("idPayrollCompanyEdit").getValue().length > 100){
                    oView.byId("idPayrollCompanyEdit").setValueState("Error");
                    oView.byId("idPayrollCompanyEdit").setValueStateText("Name must be within 100 character");
                    return;
                }

                var oPayload = {
                    Id:oModel.getProperty("/EditFields/Id"),
                    Name:oModel.getProperty("/EditFields/Name"),
                };
                
                var othat = this;
                oData.update("/MasterPayrollCompanies("+Number(oModel.getProperty("/EditFields/Id"))+")", oPayload, {
                    success: function () {
                        oModel.setProperty("/EditFields", {});
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
                        showSearchButton: true,
                        search: othat.onFilterBarSearch.bind(othat)
                    });
                    oFilterBar.setBasicSearch(oBasicSearch);
                }
                promise.resolve();
                return promise;

            },
            onFilterBarSearch: function () {
                var filters = [];
                var query = this.getView().byId("filterbar").getBasicSearchValue();
                if (query && query.length > 0) {
                    var nameFilter = new sap.ui.model.Filter({
                        path: "Name",
                        operator: "Contains",
                        value1: query.trim(),
                        caseSensitive: false
                    });

                    filters.push(nameFilter);
                }

                var list = this.getView().byId("idPayrollTable");
                var binding = list.getBinding("items");
                binding.filter(filters);
            },
            onResetFilterBar: function () {
                var oList = this.getView().byId("idPayrollTable");
                var oBinding = oList.getBinding("items");
                oBinding.filter([]);

            },
        }
        );
    }
);