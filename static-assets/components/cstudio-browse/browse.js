(function (window, $, Handlebars) {
    'use strict';

    if (typeof CStudioBrowse == "undefined" || !CStudioBrowse) {
       var CStudioBrowse= {};
    }

    CStudioBrowse.init = function() {
        var searchContext = this.determineSearchContextFromUrl();
        CStudioBrowse.searchContext = searchContext;
        CStudioBrowse.renderSiteFolders(searchContext.site, searchContext.path);
    }

    CStudioBrowse.bindEvents = function() {
        var $tree = $('#data'),
            $resultsContainer = $('#cstudio-wcm-search-result .results'),
            $resultsActions = $('#cstudio-wcm-search-result .cstudio-results-actions'),
            searchContext = CStudioBrowse.searchContext;

        //tree related events

        $tree.on('ready.jstree', function(event, data){
            var tree = data.instance;
            var obj = tree.get_selected(true)[0];
            CStudioBrowse.currentSelection = "";

            if (obj) {
                tree.trigger('select_node', { 'node' : obj, 'selected' : tree._data.core.selected, 'event' : event });
            }

            CStudioBrowse.renderContextMenu();

        });

        $tree.on('select_node.jstree', function(event, data){
            var path = data.node.a_attr["data-path"];

            if(CStudioBrowse.currentSelection != data.node.id){
                CStudioBrowse.renderSiteContent(searchContext.site, path);
                CStudioBrowse.currentSelection = data.node.id;
            }

        });

        $('.cstudio-browse-container').on('click', '.path span', function(){
            var path = $(this).attr('data-path');

            CStudioBrowse.renderSiteContent(CStudioBrowse.searchContext.site, path);
        });

        $tree.on('open_node.jstree', function(event, node){
            // $tree.trigger('select_node.jstree', [node])  //TODO: find out how to show node as selected
            $("#" + node.node.id + "_anchor").click()
        });

        //results related events

        $resultsContainer.on('change', 'input[name=result-select]', function(){
            var contentTO = $(this.parentElement.parentElement).data("item");

            CStudioBrowse.validateSelections();

            if ($(this).prop("type") === "radio") { // just select one if its radio button
                CStudioAuthoring.SelectedContent.clear();
            }

            if($(this).is(":checked")){
                CStudioAuthoring.SelectedContent.selectContent(contentTO);
            }else{
                CStudioAuthoring.SelectedContent.unselectContent(contentTO);
            }
        });

        $resultsActions.on('click', '.cstudio-search-select-all', function(){
            var checkBoxes = $resultsContainer.find('input[name=result-select]');
            checkBoxes.prop('checked', true).trigger('change');
        });

        $resultsActions.on('click', '.cstudio-search-clear-selection', function(){
            var checkBoxes = $resultsContainer.find('input[name=result-select]');
            checkBoxes.prop('checked', false).trigger('change');
        });

        $('#cstudio-command-controls').on('click', '#formSaveButton', function(){
            CStudioBrowse.saveContent();
        })

        $('#cstudio-command-controls').on('click', '#formCancelButton', function(){
            window.close();
            $(window.frameElement.parentElement).closest('.studio-ice-dialog').parent().remove(); //TODO: find a better way
        })

        $('#cstudio-command-controls').on('click', '#colExpButtonBtn', function(){


            if (top !== window) {
                $(window.frameElement.parentElement).closest('.studio-ice-dialog').height(60);
            }
        })

        $resultsContainer.on('click', '.add-close-btn', function() {
            var input = $(this).closest('.cstudio-search-result').find('.cstudio-search-select-container input');
            input.prop('checked', true).trigger('change');
            CStudioBrowse.saveContent();
        });

        $resultsContainer.on('click', '.magnify-icon', function(){
            var path = $(this).attr('data-source');
            CStudioBrowse.magnify(path);
        });
    }

    $(function() {
        CStudioBrowse.init();
        CStudioBrowse.bindEvents();
    });

    //Utilities

    CStudioBrowse.determineSearchContextFromUrl = function() {
        var searchContext = {};

        var queryString = document.location.search;

        var paramMode = CStudioAuthoring.Utils.getQueryVariable(queryString, "mode");
        var paramContext = CStudioAuthoring.Utils.getQueryVariable(queryString, "context");
        var paramSelection = CStudioAuthoring.Utils.getQueryVariable(queryString, "selection");
        var searchId = CStudioAuthoring.Utils.getQueryVariable(queryString, "searchId");
        var path = CStudioAuthoring.Utils.getQueryVariable(queryString, "PATH");
        var site = CStudioAuthoring.Utils.getQueryVariable(queryString, "site");

        //TODO: check what are all of those for
        /* configre search context */
        searchContext.contextName = (paramContext) ? paramContext : "default";
        searchContext.searchId = (searchId) ? searchId : null;      //TODO: what is this ID for?
        searchContext.interactMode = paramMode;
        searchContext.presearch = true;
        searchContext.path = path;
        searchContext.site = site;


        // selectLimit = -1 (can select all), 0 (none), 1 (only one), >1 (exact amount)

        /* configure selection control settings */
        if(paramSelection) {
            if(paramSelection < -1) {
                searchContext.selectMode = "none";
                searchContext.selectLimit = 0;
            }
            else if(paramSelection == -1) {
                searchContext.selectMode = "many";
                searchContext.selectLimit = -1;
            }
            else if(paramSelection == 0) {
                searchContext.selectMode = "none";
                searchContext.selectLimit = 0;
            }
            else if(paramSelection == 1) {
                searchContext.selectMode = "one";
                searchContext.selectLimit = 1;
            }
            else {
                searchContext.selectMode = "many";
                searchContext.selectLimit = paramSelection;
            }
        }
        else {
            searchContext.selectMode = "none";
            searchContext.selectLimit = 0;
        }

        return searchContext;
    }

    CStudioBrowse.parseObjForTree = function(obj){
        var parsed = JSON.parse(JSON.stringify(obj), function(key, value) {
            if (key === "children"){
                    $.each(value, function(index, elem){
                        if(elem.numOfChildren === 0){
                            value[index].li_attr = {
                                "data-display" : 'hidden-node'
                            };
                        } else {
                            value[index].state = {'closed': true};
                            value[index].children = true;
                        }
                    })
            }
            if (key === "path"){
                this.a_attr = {
                    "data-path": value
                }
            }
            if (key === "internalName") {
                this.text = value;
            }else {
                return value;
            }
        });

        parsed[0].state = { selected : true };

        return parsed;
    }

    CStudioBrowse.renderItem = function(item) {
        var $resultsContainer = $('#cstudio-wcm-search-result .results');

        var source = $("#hb-search-result").html();
        var template = Handlebars.compile(source);

        item.selectMode = CStudioBrowse.searchContext.selectMode;
        item.status = CStudioBrowse.getItemState(item);
        item.labelUrl = CMgs.format(browseLangBundle, 'labelUrl');
        item.labelType = CMgs.format(browseLangBundle, 'labelType');
        item.labelAddClose = CMgs.format(browseLangBundle, 'labelAddClose');

        //TODO: temporary - remove and find a way of getting result type - right now only detecting if image
        $("<img>", {
            src: item.browserUri,
            error: function() {
                var type = item.isAsset ? "asset" : item.isComponent ? "component" : "page",
                    showUrl = type == "asset" || type == "page" ? true : false;
                item.type = type;
                item.showUrl = showUrl;
                var html = template(item);
                var addedElem = $(html).appendTo($resultsContainer);
                addedElem.data("item", item);
            },
            load: function() {
                var showUrl = true;
                item.type = "image";
                item.showUrl = showUrl;
                var html = template(item);
                var addedElem = $(html).appendTo($resultsContainer);
                addedElem.data("item", item);
            }
        });
    }

    CStudioBrowse.renderNoItems = function() {
        var $resultsContainer = $('#cstudio-wcm-search-result .results'),
            msj = "There are no files at this path.";

        $resultsContainer.append('<p style="text-align: center; font-weight: bold;">' + msj + '</p>');
    }

    CStudioBrowse.renderItemsActions = function(){
        var searchContext = CStudioBrowse.searchContext,
            $actionsContainer = $('#cstudio-wcm-search-result .cstudio-results-actions');
        $actionsContainer.empty();

        if(searchContext.selectMode == "many"){
            var source = $("#hb-search-results-actions-buttons").html(),
                template = Handlebars.compile(source),
                config = {},
                html;

            config.onlyClear = searchContext.selectLimit == -1;
            config.labelSelectAll = CMgs.format(browseLangBundle, 'selectAll');
            config.labelClearAll = CMgs.format(browseLangBundle, 'clearAll');

            html = template(config);
            $actionsContainer.html(html);
        }
    }

    CStudioBrowse.refreshCurrentResults = function() {
        var searchContext = CStudioBrowse.searchContext;

        CStudioBrowse.renderSiteContent(searchContext.site, CStudioBrowse.currentResultsPath);
    }

    CStudioBrowse.getItemState = function(item) {
        return CStudioAuthoring.Utils.getIconFWClasses(item);
    }

    CStudioBrowse.validateSelections = function(){
        var searchContext = CStudioBrowse.searchContext,
            selectLimit = searchContext.selectLimit,
            $resultsContainer = $('#cstudio-wcm-search-result .results'),
            selectedItems = $resultsContainer.find('input[name=result-select]:checked'),
            unSelectedItems = $resultsContainer.find('input[name=result-select]:not(:checked)'),
            addBtn = $('#formSaveButton');

        if(selectedItems.length > 0) {
            addBtn.prop('disabled', false);
        }else{
            addBtn.prop('disabled', true);
        }

        if(searchContext.selectLimit > 1) {
            if(selectedItems.length >= selectLimit){
                unSelectedItems.attr("disabled", true);
            }else{
                unSelectedItems.removeAttr("disabled");
            }
        }
    }

    CStudioBrowse.saveContent = function() {
        var searchId = CStudioBrowse.searchContext.searchId;
        var crossServerAccess = false;

        try {
            // unfortunately we cannot signal a form close across servers
            // our preview is in one server
            // our authoring is in another
            // in this case we just close the window, no way to pass back details which is ok in some cases
            if(window.opener.CStudioAuthoring) { }
        }
        catch(crossServerAccessErr) {
            crossServerAccess = true;
        }

        if(window.opener && !crossServerAccess) {

            if(window.opener.CStudioAuthoring) {

                var openerChildSearchMgr = window.opener.CStudioAuthoring.ChildSearchManager;

                if(openerChildSearchMgr) {

                    var searchConfig = openerChildSearchMgr.searches[searchId];

                    if(searchConfig) {
                        var callback = searchConfig.saveCallback;

                        if(callback) {
                            var selectedContentTOs = CStudioAuthoring.SelectedContent.getSelectedContent();

                            openerChildSearchMgr.signalSearchClose(searchId, selectedContentTOs);
                        }
                        else {
                            //TODO PUT THIS BACK
                            //alert("no success callback provided for seach: " + searchId);
                        }
                    }
                    else {
                        alert("unable to lookup child form callback for search:" + searchId);
                    }
                }
                else {
                    alert("unable to lookup parent context for search:" + searchId);
                }
            }

            window.close();
            $(window.frameElement.parentElement).closest('.studio-ice-dialog').parent().remove(); //TODO: find a better way
        }
        else {
            // no window opening context or cross server call
            // the only thing we can do is close the window
            window.close();
            $(window.frameElement.parentElement).closest('.studio-ice-dialog').parent().remove(); //TODO: find a better way
        }
    }

    CStudioBrowse.magnify = function(source) {
        var $container = $('.cstudio-browse-image-popup-overlay'),
            $img = $container.find('img');

        $img.attr('src', source);

        $container.show();

        $container.one('click', '.close', function(){
            $container.hide();
        });

        $container.on('click', function(e) {
            if (e.target !== this)
                return;

            $container.hide();
        });

    }

    CStudioBrowse.renderContextMenu = function() {
        var searchContext = CStudioBrowse.searchContext,
            permissions = CStudioBrowse._getUserPermissions(searchContext.site, searchContext.path);

        permissions.then(function(response){
            var isWrite = CStudioAuthoring.Service.isWrite(response.permissions);

            if(isWrite != false) {
                $.contextMenu({
                    selector: '.jstree-anchor',
                    callback: function(key, options) {
                        var upload = CStudioBrowse.uploadContent(searchContext.site, options.$trigger.attr('data-path'));
                        upload.then(function(){
                            CStudioBrowse.refreshCurrentResults();
                        })
                    },
                    items: {    
                        "upload": {name: CMgs.format(browseLangBundle, 'uploadLabel')}          //TODO: change to resources
                    }
                });
            }
        })
    }

    //Services

    CStudioBrowse.renderSiteFolders = function(site, path){
        //Removes jstree cached state from localStorage
        localStorage.removeItem('jstree');
        //Tree - default closed
        $.jstree.defaults.core.expand_selected_onload = false;
        $('#data').jstree({
            'core' : {
                'check_callback': true,
                'data' : function (node, cb) {
                    var notRoot = (typeof node.a_attr !== 'undefined' && typeof node.a_attr['data-path'] !== 'undefined');
                    var currentPath = notRoot ? node.a_attr['data-path'] : path; // use node path or root path
                    var foldersPromise = CStudioBrowse._lookupSiteFolders(site, currentPath);
                    foldersPromise.then(function (treeData) {
                        var items = new Array(treeData.item);
                        items = CStudioBrowse.parseObjForTree(items);
                        if (notRoot) { // do this when it is not root level
                            items = items[0].children;
                        }
                        cb(items);
                    });
                }
            },
            "types" : {
                "default" : {
                    "icon" : "status-icon folder"
                }
            },
            "plugins" : [
                "state", "types"
            ]
        });
    }

    CStudioBrowse._lookupSiteFolders = function(site, path){
        var d = new $.Deferred();

        CStudioAuthoring.Service.lookupSiteFolders(site, path, 2, "default", {
            success: function(treeData) {   //done (?)
                d.resolve(treeData);
            },
            failure: function(){    //fail (?)

            }
        });

        return d.promise();

    }

    CStudioBrowse.renderSiteContent = function(site, path){
        var $resultsContainer = $('#cstudio-wcm-search-result .results'),
            $resultsActions = $('#cstudio-wcm-search-result .cstudio-results-actions'),
            contentPromise = CStudioBrowse._lookupSiteContent(site, path);

        $resultsContainer.empty();
        $resultsActions.empty();

        contentPromise.then(function (results) {
            var filesPresent = false;
            results = results.item.children;

            var pathLabel = path.replace(/\//g, ' / ');
            $('.current-folder .path').html(pathLabel);

            if(results.length > 0){
                $.each(results, function(index, value){
                    if(!value.folder){
                        CStudioBrowse.renderItem(value);
                        filesPresent = true;
                    }
                })

                if(filesPresent){
                    CStudioBrowse.renderItemsActions();
                }else{
                    CStudioBrowse.renderNoItems();
                }
            }

            CStudioBrowse.currentResultsPath = path;

        });
    }

    CStudioBrowse._lookupSiteContent = function(site, path){
        var d = new $.Deferred();

        CStudioAuthoring.Service.lookupSiteContent(site, path, 1, "default", {
            success: function(results) {
                d.resolve(results);
            },
            failure: function() {

            }
        });

        return d.promise();
    }

    CStudioBrowse._getUserPermissions = function(site, path){
        var d = new $.Deferred();

        CStudioAuthoring.Service.getUserPermissions(site, path, {
            success: function(results){
                d.resolve(results);
            },
            failure: function(){

            }
        });

        return d.promise();
    }

    CStudioBrowse.uploadContent = function(site, path) {
        var d = new $.Deferred();

        CStudioAuthoring.Operations.uploadAsset(site, path, "upload", {
            success: function(results){
                d.resolve(results);
            },
            failure: function(){

            }
        });

        return d.promise();
    };

}) (window, jQuery, Handlebars);