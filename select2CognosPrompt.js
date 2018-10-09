function loadCss(url) {
	var link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = url;
	document.getElementsByTagName("head")[0].appendChild(link);
};

loadCss('https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/css/select2.min.css')

define(['jquery', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/js/select2.min.js'], function ($) {

	function CustomSelect2() {};

	CustomSelect2.prototype.draw = function (oControlHost) {

		var sPromptName = oControlHost.configuration['promptName'];
		var sWidth = oControlHost.configuration['width'];
		var oControl = oControlHost.page.getControlByName(sPromptName);
		var multiSelect = false;
		var paramName = oControl.parameter;
		var paramValues = oControlHost.getParameter(paramName);
		var dataStore = oControlHost.control.dataStores[0];
		var dataStoreCount = oControlHost.control.dataStores.length;
		var sHTML = '<select class="_CognosSelect2"style="width:' + sWidth + ';" />';
		var cContainter = oControlHost.container;
		$(cContainter).append(sHTML);

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

			if (promptData[iRow].use == null) {
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

				nNextElement = ((iRow - undefineds < oControlHost.control.dataStores[0].rowCount - 1) ? iRow - undefineds + 1 : iRow - undefineds);
				select2Data[iRow - undefineds].level = oControlHost.control.dataStores[0].getCellValue(iRow - undefineds, 0);
				select2Data[iRow - undefineds].nextlevel = oControlHost.control.dataStores[0].getCellValue(nNextElement, 0);
			}

		};

		function setPromptValues (event) {
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
		
		
		$('._CognosSelect2', cContainter).on('select2:select', function (event) {
			setPromptValues(this);
			if (!multiSelect) {
				oControlHost.next();
			};
			if(multiSelect) {
				$('._selectCheck', cContainter).css({
					'display': 'table-cell'
				});
			};
		}).on('select2:unselect', function (event) {
			setPromptValues(this);
		});

		$('._CognosSelect2', cContainter).select2({
			data: select2Data,
			templateResult: formatElement,
			multiple: multiSelect
		});

		
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
				'vertical-align': 'middle'
			});

			$('._CognosSelect2', cContainter).on("click", function () {
				$("#mySelectElement").select2("close")
				//oControlHost.next();
			});

		}

		
		var selectedValues = [];
		paramValues.values.forEach(function (element) {
			var paramIndex = select2Data.findIndex(function (e) {
					return e.mun == element.use;
				});
			selectedValues.push(paramIndex);
		});

		$('._CognosSelect2', cContainter).val(selectedValues).trigger('change');

	}

	return CustomSelect2;
});
