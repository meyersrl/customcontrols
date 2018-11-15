// Function to load css for select2
function loadCss(url) {
	var link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = url;
	document.getElementsByTagName("head")[0].appendChild(link);
};

loadCss('https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/css/select2.min.css')

// RequireJS define to include Jquery and Select2 JS files
define(['jquery', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/js/select2.min.js'], function ($) {

	function CustomSelect2() {};

	CustomSelect2.prototype.draw = function (oControlHost) {
		//Get parameters from Custom Control
		var sPromptName = oControlHost.configuration['promptName'];
		var sWidth = oControlHost.configuration['width'];
		var promptHide = oControlHost.configuration['promptHide'];
		//Get the cognos prompt
		var oControl = oControlHost.page.getControlByName(sPromptName);
		//Put the cognos prompt in a div and hide if true
		if (promptHide) {
			$(oControl.element).wrapAll('<div style="display:none" class="MyDiv" />');
		};
		//Multiselect is inside a custom variable that has a different name in different environments.  We grab the 2nd item which has the select element for the prompt including an attribute for multiselect
		var cKeys = Object.keys(oControl);
		var cKeys = cKeys[1];
		var multiSelect = (oControl[cKeys].getAttribute('multiSelect') == 'true');
		//Get prompt autosubmit value
		var cAutoSubmit = oControl.autoSubmit;
		//Disable auto submit on the cognos prompt.  Auto submit on both select2 and the cognos prompt results in an error
		oControl.autoSubmit = false;
		//Get the parameter name from the prompt
		var paramName = oControl.parameter;
		//Get the existing values in the parameter
		var paramValues = oControlHost.getParameter(paramName);
		//If a datastore is added with the level number for each element grab it and the length
		var dataStore = oControlHost.control.dataStores[0];
		var dataStoreCount = oControlHost.control.dataStores.length;
		//Grab the custom control container and append the select into it so we can bind select2
		var sHTML = '<select class="_CognosSelect2"style="width:' + sWidth + ';" />';
		var cContainter = oControlHost.container;
		$(cContainter).append(sHTML);
		//Get all values in prompt
		var promptData = oControl.getValues(true);

		//This is a select2 format template that allows us to change the format of each item in the select list.  If the level number is provided in a datastore we can indent and bold using this template.
		function formatElement(element) {
			if (dataStoreCount = 0) {
				return element.text;
			}

			var nIndent = element.level * 10;
			var sCSS = '<span style="padding-left:' + nIndent + 'px;' + ((element.nextlevel <= element.level) ? '' : 'font-weight: 900;') + '">' + element.text + '</span>';

			var $element = $(
					sCSS);

			return $element;
		};

		//Create the dataset we bind to the select2 item.
		var select2Data = [];
		//Prompts can contain header rows that have text and no values.  We need to skip these to only get the values.  Undefineds tracks the header rows
		var undefineds = 0;

		for (iRow = 0; iRow < promptData.length; iRow++) {
			//Look for header rows and skip if found
			if (promptData[iRow].use == null) {
				undefineds++;
				continue;
			}
			//Create select2 dataset including attributes
			select2Data[iRow - undefineds] = {
				id: iRow - undefineds,
				datastoreId: iRow,
				text: promptData[iRow].display,
				mun: promptData[iRow].use
			};
			//If the elevel number dataset is provided then track it here.  This allows us to format the dataset in select2 with bold and indenting
			if (dataStoreCount > 0) {

				nNextElement = ((iRow - undefineds < oControlHost.control.dataStores[0].rowCount - 1) ? iRow - undefineds + 1 : iRow - undefineds);
				select2Data[iRow - undefineds].level = oControlHost.control.dataStores[0].getCellValue(iRow - undefineds, 0);
				select2Data[iRow - undefineds].nextlevel = oControlHost.control.dataStores[0].getCellValue(nNextElement, 0);
			}

		};
		//Function to look at the select2 selected items and set the values in the cognos prompt
		function setPromptValues(event) {
			select2Data = $(event).select2('data');
			select2DataLength = select2Data.length;
			promptValues = [];
			for (var iRow = 0; iRow < select2DataLength; iRow++) {
				var useValue = select2Data[iRow].mun;
				promptValues[iRow] = {};
				promptValues[iRow].use = useValue;
			}
			oControl.setValues(promptValues);
		};
		//Select and Unselect events for select2.  If multiSelect then disable autosubmit and show a refresh icon to submit/refresh
		$('._CognosSelect2', cContainter).on('select2:select select2:unselect', function (event) {
			setPromptValues(this);
			if (!multiSelect && cAutoSubmit) {
				oControlHost.next();
			};
			if (multiSelect) {
				$('._selectCheck', cContainter).css({
					'display': 'table-cell'
				});
			};
		});
		//Initialize the select2 on the original select2 element
		$('._CognosSelect2', cContainter).select2({
			data: select2Data,
			templateResult: formatElement,
			multiple: multiSelect
		});
		//If multiselect is set then wrap the select in a div so we can put a submit button next to it
		if (multiSelect) {
			$(cContainter).append("<div class='_selectCheck'>&#8635;</div>");
			$(cContainter).css({
				'display': 'table'
			});

			$('._selectCheck', cContainter).css({
				'display': 'none',
				'padding-left': '7px',
				'font-size': '2.25em',
				'font-weight': 'bold',
				'cursor': 'pointer',
				'vertical-align': 'middle',
				'width': '40px'
			});
			//Set the onclick of the submit button.  Close all select2 dropdowns (due to issue with it being left open) and submit the prompts
			$('._selectCheck', cContainter).on("click", function () {
				$('._CognosSelect2').each(function (index) {
					$(this).select2("close");
				});
				setTimeout(oControlHost.next(), 1000);
			});

		}
		//Find the selected values in the prompt and then set the select2 dropdown to match.
		var selectedValues = [];
		paramValues.values.forEach(function (element) {
			var paramIndex = select2Data.findIndex(function (e) {
					return e.mun == element.use;
				});
			selectedValues.push(paramIndex);
		});
		//Trigger the change to make the selections show in select2
		$('._CognosSelect2', cContainter).val(selectedValues).trigger('change');

	}

	return CustomSelect2;
});

