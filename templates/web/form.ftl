<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Crafter Studio</title>

    <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!''}"></script>

    <link rel="stylesheet" href="/studio/static-assets/themes/cstudioTheme/css/forms-default.css?version=${UIBuildId!''}"/>
    <link rel="stylesheet" href="/studio/static-assets/styles/forms-engine.css?version=${UIBuildId!''}"/>

    <#include "/templates/web/common/page-fragments/head.ftl" />
    <#include "/templates/web/common/page-fragments/studio-context.ftl" />

    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/en/base.js?version=${UIBuildId!''}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/kr/base.js?version=${UIBuildId!''}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/es/base.js?version=${UIBuildId!''}"></script>

    <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/yui/assets/rte.css?version=${UIBuildId!''}" />
    <script type="text/javascript" src="/studio/static-assets/modules/editors/tiny_mce/tiny_mce.js?version=${UIBuildId!''}"></script>

    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/amplify-core.js?version=${UIBuildId!''}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-forms/forms-engine.js?version=${UIBuildId!''}"></script>

    <script src="/studio/static-assets/scripts/communicator.js?version=${UIBuildId!''}"></script>
    <script src="/studio/static-assets/libs/amplify/lib/amplify.core.js?version=${UIBuildId!''}"></script>
    <script src="/studio/static-assets/libs/jquery/dist/jquery.js?version=${UIBuildId!''}"></script>
    <script src="/studio/static-assets/libs/jquery-ui/jquery-ui.js?version=${UIBuildId!''}"></script>
    <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!''}"></script>
    <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!''}"></script>
     <script src="/studio/static-assets/components/cstudio-components/loader.js?version=${UIBuildId!''}"></script>

    <script>document.domain = "${Request.serverName}";</script> <!-- blah blah -->
    
</head>

<body class="yui-skin-cstudioTheme">

<header style="display: none;">
    <hgroup>
        <div class="page-header">
            <div class="container">
                <h1>
                    <span class="header"></span>
                    <div>
                        <small class="name"></small>
                        <small class="location"></small>
                    </div>
                </h1>
                <p class="page-description"></p>
            </div>
        </div>
    </hgroup>
    <div class="container">
        <a id="cstudio-form-expand-all" href="javascript:"></a> |
        <a id="cstudio-form-collapse-all" href="javascript:"></a>
    </div>
</header>

<div id="formContainer"></div>

<script>
    YAHOO.util.Event.onDOMReady(function() {
        var formId = CStudioAuthoring.Utils.getQueryVariable(location.search, "form");
        CStudioForms.engine.render(formId, "default", "formContainer");
    });
</script>

</body>
</html>
