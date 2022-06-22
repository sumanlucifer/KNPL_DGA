sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "../model/formatter",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/Sorter",
        "sap/ui/core/format/DateFormat",
        "sap/ui/Device",
        "sap/ui/unified/library",
        "sap/m/library",
        "sap/ui/core/library"
    ],
    function (
        BaseController,
        JSONModel,
        formatter,
        Filter,
        FilterOperator,
        MessageBox,
        MessageToast,
        Fragment,
        Sorter,
        DateFormat,
        Device, unifiedLibrary, mobileLibrary, coreLibrary
    ) {
        "use strict";

        var CalendarDayType = unifiedLibrary.CalendarDayType;
        var ValueState = coreLibrary.ValueState;
        var StickyMode = mobileLibrary.PlanningCalendarStickyMode;

        return BaseController.extend(
            "com.knpl.dga.complains.controller.Worklist",
            {
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
                            ComplaintTypeId: "",
                            ComplaintSubTypeId: "",
                            StartDate: null,
                            EndDate: null,
                            ComplaintStatus: "",
                            Name: "",
                            ZoneId: "",
                            DivisionId: "",
                            DepotId: "",
                            Escalate: "",
                            ApprovalStatus:"",
                            LeadStage: "",
                            ComplaintID: ""
                        },
                        withdrawComments: ""
                    };
                    var oMdlCtrl = new JSONModel(oDataControl);
                    this.getView().setModel(oMdlCtrl, "oModelControl");
                    oRouter
                        .getRoute("worklist")
                        .attachMatched(this._onRouteMatched, this);
                    var startupParams = null;
                    if (this.getOwnerComponent().getComponentData()) {
                        // console.log("Inside If Condition")
                        startupParams = this.getOwnerComponent().getComponentData().startupParameters;

                    }
                    // console.log(startupParams);
                    if (startupParams) {
                        if (startupParams.hasOwnProperty("Id")) {
                            if (startupParams["Id"].length > 0) {
                                this._onNavToAdd(startupParams["Id"][0]);
                            }
                        }
                    }


                    //console.log("Init View");
                },
                _onRouteMatched: function () {

                    this._InitData();
                },
                _onNavToAdd: function (mParam) {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteAddCmp", {
                        Id: mParam
                    });
                    //this.onCrossNavigate("CP")

                },

                _InitData: function () {
                    var oViewModel,
                        iOriginalBusyDelay,
                        oTable = this.byId("table");

                    // Put down worklist table's original value for busy indicator delay,
                    // so it can be restored later on. Busy handling on the table is
                    // taken care of by the table itself.
                    iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
                    // keeps the search state
                    this._aTableSearchState = [];

                    // Model used to manipulate control states
                    oViewModel = new JSONModel({
                        worklistTableTitle: this.getResourceBundle().getText(
                            "worklistTableTitle"
                        ),
                        shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
                        shareSendEmailSubject: this.getResourceBundle().getText(
                            "shareSendEmailWorklistSubject"
                        ),
                        shareSendEmailMessage: this.getResourceBundle().getText(
                            "shareSendEmailWorklistMessage",
                            [location.href]
                        ),
                        tableNoDataText: this.getResourceBundle().getText(
                            "tableNoDataText"
                        ),
                        tableBusyDelay: 0,
                    });
                    this.setModel(oViewModel, "worklistView");

                    // Make sure, busy indication is showing immediately so there is no
                    // break after the busy indication for loading the view's meta data is
                    // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
                    oTable.attachEventOnce("updateFinished", function () {
                        // Restore original busy indicator delay for worklist's table
                        oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
                    });
                    this.getView().getModel().refresh();
                    //this._fiterBarSort();
                    this._addSearchFieldAssociationToFB();
                    this._getLoggedInInfo();
                },
                _fiterBarSort: function () {
                    if (this._ViewSortDialog) {
                        var oDialog = this.getView().byId("viewSetting");
                        oDialog.setSortDescending(true);
                        oDialog.setSelectedSortItem("CreatedAt");
                    }
                },
                _getLoggedInInfo: function () {
                    var oData = this.getModel();
                    var oLoginData = this.getView().getModel("LoginInfo");
                    oData.callFunction("/GetLoggedInAdmin", {
                        method: "GET",
                        urlParameters: {
                            $expand: "UserType",
                        },
                        success: function (data) {
                            if (data.hasOwnProperty("results")) {
                                if (data["results"].length > 0) {
                                    oLoginData.setData(data["results"][0]);
                                    // console.log(oLoginData)
                                }
                            }
                        },
                    });
                },

                onFilter: function () {
                    var aCurrentFilterValues = [];
                    var oViewFilter = this.getView()
                        .getModel("oModelControl")
                        .getProperty("/filterBar");

                    var aFlaEmpty = true;
                    for (let prop in oViewFilter) {
                        if (oViewFilter[prop]) {
                            if (prop === "ComplaintTypeId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "ComplaintTypeId",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                );
                            } else if (prop === "ApprovalStatus") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "ApprovalStatus",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                    //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                                );
                            }  else if (prop === "ComplaintID") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "ComplaintCode",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                    //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                                );
                            } else if (prop === "LeadStage") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "LeadStage",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                    //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                                );
                            } else if (prop === "ComplaintSubTypeId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "ComplaintSubtype/Id",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                    //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                                );
                            } else if (prop === "StartDate") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "CreatedAt",
                                        FilterOperator.GE,
                                        new Date(oViewFilter[prop])
                                    )
                                    //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                                );
                            } else if (prop === "EndDate") {
                                aFlaEmpty = false;
                                var oDate = oViewFilter[prop].setDate(oViewFilter[prop].getDate() + 1);
                                aCurrentFilterValues.push(
                                    new Filter("CreatedAt", FilterOperator.LT, oDate)
                                    //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                                );
                            } else if (prop === "ComplaintStatus") {
                                aFlaEmpty = false;
                               
                                    aCurrentFilterValues.push(
                                        new Filter(prop, FilterOperator.EQ, oViewFilter[prop]));
                            } else if (prop === "Escalate") {
                                aFlaEmpty = false;
                                // if (oViewFilter[prop] === "YES") {
                                //     aCurrentFilterValues.push(
                                //         new Filter("EscalationType", FilterOperator.EQ,"TAT"));
                                // } else {
                                //     aCurrentFilterValues.push(
                                //         new Filter("EscalationType", FilterOperator.EQ,null));
                                // }
                                //AssigneUserType
                                aCurrentFilterValues.push(
                                         new Filter("AssigneUserType", FilterOperator.Contains,  oViewFilter[prop] ));
                            

                            } else if (prop === "ZoneId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/ZoneId", FilterOperator.EQ, oViewFilter[prop]));
                            } else if (prop === "DivisionId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/DivisionId", FilterOperator.EQ, oViewFilter[prop]));
                            } else if (prop === "DepotId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/DepotId", FilterOperator.EQ, oViewFilter[prop]));
                            } else if (prop === "Name") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        [
                                            new Filter(
                                                "tolower(DGA/GivenName)",
                                                FilterOperator.Contains,
                                                "'" +
                                                oViewFilter[prop]
                                                    .trim()
                                                    .toLowerCase()
                                                    .replace("'", "''") +
                                                "'"
                                            ),
                                            new Filter(
                                                "tolower(ConsumerName)",
                                                FilterOperator.Contains,
                                                "'" +
                                                oViewFilter[prop]
                                                    .trim()
                                                    .toLowerCase()
                                                    .replace("'", "''") +
                                                "'"
                                            ),
                                            new Filter(
                                                "ConsumerMobileNo",
                                                FilterOperator.Contains,
                                                oViewFilter[prop].trim()
                                            ),
                                            new Filter(
                                                "ComplaintStatus",
                                                FilterOperator.Contains,
                                                oViewFilter[prop].trim().toUpperCase()
                                            ),
                                            new Filter(
                                                "LeadStage",
                                                FilterOperator.Contains,
                                                oViewFilter[prop].trim().toUpperCase()
                                            ),
                                            new Filter(
                                                "ComplaintCode",
                                                FilterOperator.Contains,
                                                oViewFilter[prop].trim()
                                            )
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
                    var oTable = this.getView().byId("table");
                    var oBinding = oTable.getBinding("items");
                    if (!aFlaEmpty) {
                        oBinding.filter(endFilter);
                    } else {
                        oBinding.filter([]);
                    }
                },
                onValueHelpRequest: function (oEvent) {
                    var sInputValue = oEvent.getSource().getValue(),
                        oView = this.getView();

                    if (!this._pValueHelpDialog) {
                        this._pValueHelpDialog = Fragment.load({
                            id: oView.getId(),
                            name:
                                "com.knpl.dga.complains.view.fragments.ComplaintIDValueHelpDialog",
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
                                                path: "ComplaintCode",
                                                operator: "Contains",
                                                value1: sInputValue.trim(),
                                                caseSensitive: false
                                            }
                                        ),
                                        // new Filter(
                                        //     {
                                        //         path: "Mobile",
                                        //         operator: "Contains",
                                        //         value1: sInputValue.trim(),
                                        //         caseSensitive: false
                                        //     }
                                        // ),
                                    ],
                                    false
                                ),
                            ]);
                        // Open ValueHelpDialog filtered by the input's value
                        oDialog.open(sInputValue);
                    });
                },
                onValueHelpSearch: function (oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oFilter = new Filter(
                        [
                            new Filter(
                                {
                                    path: "ComplaintCode",
                                    operator: "Contains",
                                    value1: sValue.trim(),
                                    caseSensitive: false
                                }
                            ),
                            new Filter(
                                {
                                    path: "DGA/GivenName",
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
                onValueHelpClose: function (oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    oEvent.getSource().getBinding("items").filter([]);
                    var oModelControl = this.getView().getModel("oModelControl")  ;
                    if (!oSelectedItem) {
                        return;
                    }
                    var obj = oSelectedItem.getBindingContext().getObject();
                   
                    oModelControl.setProperty("/filterBar/ComplaintID",obj.ComplaintCode );
                },
                onResetFilterBar: function () {
                    this._ResetFilterBar();
                },
                onComplaintsChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();

                    var oView = this.getView();
                    var oCmbxSubType = oView.byId("idFileSubType");
                    var oFilter = new Filter("ComplaintTypeId", FilterOperator.EQ, sKey);
                    oCmbxSubType.clearSelection();
                    oCmbxSubType.setValue("");
                    if (sKey == "") {
                        oCmbxSubType.getBinding("items").filter(null);
                    } else {
                        oCmbxSubType.getBinding("items").filter(oFilter);
                    }
                },
                onZoneChange: function (oEvent) {
                    var sId = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");

                    var oDivision = oView.byId("idDivision");
                    var oDivItems = oDivision.getBinding("items");
                    var oDivSelItm = oDivision.getSelectedItem(); //.getBindingContext().getObject()
                    oDivision.clearSelection();
                    oDivision.setValue("");
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

                _ResetFilterBar: function () {
                    var aCurrentFilterValues = [];
                    var aResetProp = {
                        ComplaintTypeId: "",
                        ComplaintSubTypeId: "",
                        StartDate: null,
                        EndDate: null,
                        ComplaintStatus: "",
                        Name: "",
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: "",
                        Escalate: "",
                        ApprovalStatus:"",
                        LeadStage: "",
                        ComplaintID: ""
                    };
                    var oViewModel = this.getView().getModel("oModelControl");
                    oViewModel.setProperty("/filterBar", aResetProp);

                    var oTable = this.byId("table");
                    var oBinding = oTable.getBinding("items");
                    oBinding.filter([]);
                    oBinding.sort(new Sorter({ path: "CreatedAt", descending: true }));
                    //reset the sort order of the dialog box
                    this._fiterBarSort();
                },
                _addSearchFieldAssociationToFB: function () {
                    let oFilterBar = this.getView().byId("filterbar");
                    let oSearchField = oFilterBar.getBasicSearch();
                    var oBasicSearch;
                    var othat = this;
                    if (!oSearchField) {
                        // @ts-ignore
                        oBasicSearch = new sap.m.SearchField({
                            value: "{oModelControl>/filterBar/Name}",
                            showSearchButton: true,
                            search: othat.onFilter.bind(othat),
                        });
                    } else {
                        oSearchField = null;
                    }

                    oFilterBar.setBasicSearch(oBasicSearch);

                      oBasicSearch.attachBrowserEvent(
                        "keyup",
                        function (e) {
                          if (e.which === 13) {
                            this.onSearch();
                          }
                        }.bind(this)
                      );
                },
              
                fmtDate: function (mDate) {
                    var date = new Date(mDate);
                    var oDateFormat = DateFormat.getDateTimeInstance({
                        pattern: "dd/MM/YYYY h:mm a",
                        UTC: false,
                        strictParsing: false,
                    });
                    return oDateFormat.format(date);
                },
                handleSortButtonPressed: function () {
                    this.getViewSettingsDialog(
                        "com.knpl.dga.complains.view.fragments.SortDialog"
                    ).then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
                },
                getViewSettingsDialog: function (sDialogFragmentName) {
                    if (!this._ViewSortDialog) {
                        var othat = this;
                        this._ViewSortDialog = Fragment.load({
                            id: this.getView().getId(),
                            name: sDialogFragmentName,
                            controller: this,
                        }).then(function (oDialog) {
                            if (Device.system.desktop) {
                                othat.getView().addDependent(oDialog);
                                oDialog.addStyleClass("sapUiSizeCompact");
                            }
                            return oDialog;
                        });
                    }
                    return this._ViewSortDialog;
                },
                handleSortDialogConfirm: function (oEvent) {
                    var oTable = this.byId("table"),
                        mParams = oEvent.getParameters(),
                        oBinding = oTable.getBinding("items"),
                        sPath,
                        bDescending,
                        aSorters = [];

                    sPath = mParams.sortItem.getKey();
                    bDescending = mParams.sortDescending;
                    aSorters.push(new Sorter(sPath, bDescending));

                    // apply the selected sort and group settings
                    oBinding.sort(aSorters);
                },

                /* =========================================================== */
                /* event handlers                                              */
                /* =========================================================== */

                /**
                 * Triggered by the table's 'updateFinished' event: after new table
                 * data is available, this handler method updates the table counter.
                 * This should only happen if the update was successful, which is
                 * why this handler is attached to 'updateFinished' and not to the
                 * table's list binding's 'dataReceived' method.
                 * @param {sap.ui.base.Event} oEvent the update finished event
                 * @public
                 */
                onUpdateFinished: function (oEvent) {
                    // update the worklist's object counter after the table update
                    var sTitle,
                        oTable = oEvent.getSource(),
                        iTotalItems = oEvent.getParameter("total");
                    // only update the counter if the length is final and
                    // the table is not empty
                    if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                        sTitle = this.getResourceBundle().getText(
                            "worklistTableTitleCount",
                            [iTotalItems]
                        );
                    } else {
                        sTitle = this.getResourceBundle().getText(
                            "worklistTableTitleCount",
                            [0]
                        );
                    }
                    this.getModel("worklistView").setProperty(
                        "/worklistTableTitle",
                        sTitle
                    );
                },

                /**
                 * Event handler when a table item gets pressed
                 * @param {sap.ui.base.Event} oEvent the table selectionChange event
                 * @public
                 */
                onPress: function (oEvent) {
                    // The source is the list item that got pressed
                    this._showObject(oEvent.getSource());
                },

                /**
                 * Event handler for navigating back.
                 * We navigate back in the browser history
                 * @public
                 */
                onNavBack: function () {
                    // eslint-disable-next-line sap-no-history-manipulation
                    history.go(-1);
                },

                onSearch: function (oEvent) {
                    if (oEvent.getParameters().refreshButtonPressed) {
                        // Search field's 'refresh' button has been pressed.
                        // This is visible if you select any master list item.
                        // In this case no new search is triggered, we only
                        // refresh the list binding.
                        this.onRefresh();
                    } else {
                        var aTableSearchState = [];
                        var sQuery = oEvent.getParameter("query");

                        if (sQuery && sQuery.length > 0) {
                            aTableSearchState = [
                                new Filter("ComplaintCode", FilterOperator.Contains, sQuery),
                            ];
                        }
                        this._applySearch(aTableSearchState);
                    }
                },
                onListItemPress: function (oEvent) {
                    var oRouter = this.getOwnerComponent().getRouter();
                    var path = oEvent.getSource().getBindingContext().getPath();
                    oRouter.navTo("RouteEditCmp", {
                        prop: path.replace("/", ""),
                    });
                },

                onPressAdd: function (oEvent) {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteAddCmp", {
                        Id: "new"
                    });
                },

                /**
                 * Event handler for refresh event. Keeps filter, sort
                 * and group settings and refreshes the list binding.
                 * @public
                 */
                onRefresh: function () {
                    var oTable = this.byId("table");
                    oTable.getBinding("items").refresh();
                },

                /* =========================================================== */
                /* internal methods                                            */
                /* =========================================================== */

                /**
                 * Shows the selected item on the object page
                 * On phones a additional history entry is created
                 * @param {sap.m.ObjectListItem} oItem selected Item
                 * @private
                 */
                _showObject: function (oItem) {
                    this.getRouter().navTo("object", {
                        objectId: oItem.getBindingContext().getProperty("Id"),
                    });
                },

                /**
                 * Internal helper method to apply both filter and search state together on the list binding
                 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
                 * @private
                 */
                _applySearch: function (aTableSearchState) {
                    var oTable = this.byId("table"),
                        oViewModel = this.getModel("worklistView");
                    oTable.getBinding("items").filter(aTableSearchState, "Application");
                    // changes the noDataText of the list in case there are no filter results
                    if (aTableSearchState.length !== 0) {
                        oViewModel.setProperty(
                            "/tableNoDataText",
                            this.getResourceBundle().getText("worklistNoDataWithSearchText")
                        );
                    }
                },
            }
        );
    }
);