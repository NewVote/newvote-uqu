'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
	// Init module configuration options
	var applicationModuleName = 'newvote.uqu';
	var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngSanitize', 'ngMessages', 'ui.router', 'ui.utils',
  	'ui.carousel', 'angularFileUpload', 'ngMaterial', 'ngQuill', 'ngFileUpload', 'updateMeta', 'chart.js', 'ngMdIcons',
	'ngStorage', 'vcRecaptcha', 'angAccordion', 'cfp.hotkeys', 'bm.uiTour', 'ngclipboard'];

	// Add a new vertical module
	var registerModule = function (moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName)
			.requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
