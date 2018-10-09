function loadCss(url) {
	var link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = url;
	document.getElementsByTagName("head")[0].appendChild(link);
};

loadCss('https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/css/select2.min.css')

var sIdentifier = '';

define(['jquery', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/js/select2.min.js'], function ($) {

	function CustomSelect2() {};

	CustomSelect2.prototype.draw = function (oControlHost) {

		var sPromptName = oControlHost.configuration['promptName'];
		var sWidth = oControlHost.configuration['width'];
		var oControl = oControlHost.page.getControlByName(sPromptName);
		console.log(oControl);
		var multiSelect = false;
		var paramName = oControl.parameter;
		var paramValues = oControlHost.getParameter(paramName);
		//console.log('paramValues:');
		//console.log(paramValues);
		var dataStore = oControlHost.control.dataStores[0];
		var dataStoreCount = oControlHost.control.dataStores.length;
		sIdentifier = sPromptName + '_Select2';
		var sHTML = '<select class="' + sIdentifier + '"style="width:' + sWidth + ';" ></select>';
		var el = oControlHost.container;
		$(el).append(sHTML);

		var promptData = oControl.getValues(true);
		console.log(promptData);

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

		var select2Data = [];
		var undefineds = 0;

		for (iRow = 0; iRow < promptData.length; iRow++) {

			if (promptData[iRow].display == undefined) {
				undefineds++;
				continue;
			}

			select2Data[iRow - undefineds] = {
				id: iRow - undefineds,
				datastoreId: iRow,
				text: promptData[iRow].display,
				mun: promptData[iRow].use
			};
			if (dataStoreCount > 0) {
				console.log(oControlHost.control.dataStores[0]);
				console.log(iRow);
				console.log(undefineds);
				nNextElement = ((iRow - undefineds < oControlHost.control.dataStores[0].rowCount - 1) ? iRow - undefineds + 1 : iRow - undefineds);
				select2Data[iRow - undefineds].level = oControlHost.control.dataStores[0].getCellValue(iRow - undefineds, 0);
				select2Data[iRow - undefineds].nextlevel = oControlHost.control.dataStores[0].getCellValue(nNextElement, 0);
			}

		};

		$('.' + sIdentifier).on('select2:select select2:unselect', function (event) {
			var select2Data = $(this).select2('data');
			console.log(select2Data);
			var select2DataLength = select2Data.length;
			var promptValues = [];
			for (var iRow = 0; iRow < select2DataLength; iRow++) {
				var useValue = select2Data[iRow].mun;
				console.log(useValue);
				promptValues[iRow] = {};
				promptValues[iRow].use = useValue;
			}

			oControl.setValues(promptValues);
			if (!multiSelect) {
				oControlHost.next();
			};

		});

		$('.' + sIdentifier).select2({
			data: select2Data,
			templateResult: formatElement,
			multiple: multiSelect
		});

		
				if (multiSelect) {
			$(el).append("<div class='_selectCheck'>&#8635;</div>");
			$(el).css({
				'display': 'table'
			});

			$('._selectCheck', oControlHost.container).css({
				'display': 'none',
				'padding-left': '7px',
				'font-size': '2.25em',
				'font-weight': 'bold',
				'cursor': 'pointer',
				'vertical-align': 'middle'
			});

			$('._selectCheck', oControlHost.container).on("click", function () {
				$(this).css({
					'display': 'none'
				})
				oControlHost.next();
			});

			$('.' + sIdentifier).on('select2:close', function (event) {
				$('._selectCheck', oControlHost.container).css({
					'display': 'table-cell'
				});
			});

		}

		
		var selectedValues = [];
		paramValues.values.forEach(function (element) {
			var paramIndex = select2Data.findIndex(function (e) {
					return e.mun == element.use;
				});
			selectedValues.push(paramIndex);
		});

		$('.' + sIdentifier).val(selectedValues).trigger('change');

	}

	CustomSelect2.prototype.setData = function (oControlHost, oDataStore) {};

	CustomSelect2.prototype.getParameters = function (oControlHost) {};

	return CustomSelect2;
});
