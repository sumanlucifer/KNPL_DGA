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
            "com.knpl.dga.taskapproval.controller.Worklist", {
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
                        EndDate: null,
                        Status: "",
                        Search: "",
                        Zone: "",
                        DivisionId: "",
                        DepotId: "",
                        DealerName: "",
                        DGAMobile: ""
                    },
                    PageBusy: true
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
            _ResetFilterBar: function () {
                var aCurrentFilterValues = [];
                var aResetProp = {
                    StartDate: null,
                    EndDate: null,
                    Status: "",
                    Search: "",
                    Zone: "",
                    DivisionId: "",
                    DepotId: "",
                    DealerName: "",
                    DGAMobile: ""
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
            onBindTblComplainList: function (oEvent) {
                /*
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: init binding method for the table.
                 */
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["select"] = "Visit/DGA/GivenName,Visit/DGA/Id,Visit/DGA/Zone,Visit/DGA/Mobile,Visit/DGA/DepotId,Visit/DGA/DivisionId,Visit/TaskType/Name,Visit/TaskType/Type,Visit/Id,Visit/Date"
                oBindingParams.parameters["expand"] = "Visit/DGA,Visit/TaskType,Status,Visit/TargetLead/SourceDealer,Visit/TargetLead/SourceContractor,Visit/TargetLead/LeadStatus,Visit/TargetContractor,Visit/TargetDealer";
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
                        if (prop === "StartDate") {
                            // converstions are made as the difference between utc and the server time
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("CreatedAt", FilterOperator.GE, new Date(oViewFilter[prop])));
                        } else if (prop === "EndDate") {
                            // converstions are made as the difference between utc and the server time
                            aFlaEmpty = false;
                            var oDate = new Date(oViewFilter[prop]).setDate(oViewFilter[prop].getDate() + 1);
                            aCurrentFilterValues.push(
                                new Filter("CreatedAt", FilterOperator.LT, oDate));
                        } else if (prop === "Status") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("ComplaintStatus", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "ZoneId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Painter/ZoneId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "DvisionId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Painter/DivisionId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "DepotId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Painter/DepotId", FilterOperator.EQ, oViewFilter[prop]));
                        }
                        //Delaer Filter Pending 
                        // else if (prop === "DealerName") {
                        //     aFlaEmpty = false;
                        //     aCurrentFilterValues.push(
                        //         new Filter("Visit/DealerId", FilterOperator.EQ, oViewFilter[prop]));
                        // } 
                        else if (prop === "DGAMobile") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Visit/DGA/Mobile", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "Search") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter(
                                    [
                                        new Filter({
                                            path: "Visit/DGA/GivenName",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "Visit/Id",
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

            onResetFilterBar: function () {
                this._ResetFilterBar();
            },


            onListItemPress: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext();
                var oRouter = this.getOwnerComponent().getRouter();
                switch(oContext.getObject("Visit/TaskType/Type")){
                    case "LEAD_VISIT":
                        oRouter.navTo("Detail", {
                            context: oContext.getPath().replace("/", "")
                        });
                        break;
                    case "CONTRACTOR_VISIT":
                        oRouter.navTo("ContractorDetail", {
                            context: oContext.getPath().replace("/", "")
                        });
                        break;
                    case "DEALER_VISIT":
                        oRouter.navTo("DealerDetail", {
                            context: oContext.getPath().replace("/", "")
                        });
                        break;
                }
            },
            
            onDealerValueHelpRequest: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();

                if (!this._DealerValueHelpDialog) {
                    this._DealerValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name:
                            "com.knpl.dga.taskapproval.view.fragments.DealerValueHelpDialog",
                        controller: this,
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._DealerValueHelpDialog.then(function (oDialog) {
                    // Open ValueHelpDialog filtered by the input's value
                    oDialog.open(sInputValue);
                });
            },
            onDealerValueHelpSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter(
                    [
                        new Filter(
                            {
                                path: "Name",
                                operator: "Contains",
                                value1: sValue.trim(),
                                caseSensitive: false
                            }
                        ),
                        new Filter(
                            {
                                path: "RegionCode",
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
            onDealerValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                oEvent.getSource().getBinding("items").filter([]);
                var oViewModel = this.getView().getModel("oModelView"),
                 oModelControl = this.getView().getModel("oModelControl")  ;
                if (!oSelectedItem) {
                    return;
                }
                var obj = oSelectedItem.getBindingContext().getObject();
                oViewModel.setProperty(
                    "/addCompAddData/MembershipCard",
                    obj["MembershipCard"]
                );
                //  debugger;
                oViewModel.setProperty("/addCompAddData/Mobile", obj["Mobile"]);
                oViewModel.setProperty("/addCompAddData/Name", obj["Name"]);
                oViewModel.setProperty("/addComplaint/PainterId", obj["Id"]);
               
                oModelControl.setProperty("/DivisionId",obj.DivisionId );
                oModelControl.setProperty("/ZoneId",obj.ZoneId );

                oModelControl.setProperty("/DepotId", ""  ); 
                //Fallback as Preliminary context not supported
                this._getDepot(obj.DepotId);
                    //DivisionId,ZoneId
            },
            
            onDGAValueHelpRequest: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();

                if (!this._DGAValueHelpDialog) {
                    this._DGAValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name:
                            "com.knpl.dga.taskapproval.view.fragments.DGAValueHelpDialog",
                        controller: this,
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._DGAValueHelpDialog.then(function (oDialog) {
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
                var oViewModel = this.getView().getModel("oModelView"),
                 oModelControl = this.getView().getModel("oModelControl")  ;
                if (!oSelectedItem) {
                    return;
                }
                var obj = oSelectedItem.getBindingContext().getObject();
                oViewModel.setProperty(
                    "/addCompAddData/MembershipCard",
                    obj["MembershipCard"]
                );
                //  debugger;
                oViewModel.setProperty("/addCompAddData/Mobile", obj["Mobile"]);
                oViewModel.setProperty("/addCompAddData/Name", obj["Name"]);
                oViewModel.setProperty("/addComplaint/PainterId", obj["Id"]);
               
                oModelControl.setProperty("/DivisionId",obj.DivisionId );
                oModelControl.setProperty("/ZoneId",obj.ZoneId );

                oModelControl.setProperty("/DepotId", ""  ); 
                //Fallback as Preliminary context not supported
                this._getDepot(obj.DepotId);
                    //DivisionId,ZoneId
            },
            _onNavToDetails: function (mParam1) {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Detail", {
                    Id: mParam1,
                    Mode: "Display"
                });

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

            onPressDelete: function (oEvent) {
                var oView = this.getView();
                var oBj = oEvent.getSource().getBindingContext().getObject();
                this._showMessageBox1("information", "Message5", [oBj["ComplaintCode"]],
                    this._DeleteComplaints.bind(this, "first paramters", "secondParameter")
                );
            },
            _DeleteComplaints: function (mParam1, mParam2) {
                // after deleting the entity make sure that we are calling the refresh just on the table and not on thw whole model
                MessageToast.show("Message5")
            },

            onEditListItemPress: function (oEvent) {
                var oBj = oEvent.getSource().getBindingContext().getObject();
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Detail", {
                    Id: oBj["Id"],
                    Mode: "Edit"
                });

            }
        }
        );
    }
);