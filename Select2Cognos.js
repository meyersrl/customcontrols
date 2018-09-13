function loadCss(url) {
	var link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = url;
	document.getElementsByTagName("head")[0].appendChild(link);
};

loadCss('https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/css/select2.min.css')

function formatElement(element) {
	if (!element.id) {
		return element.text;
	}
	var originalElement = element.element;
	var nIndent = $(originalElement).attr("Level") * 10;
	var sCSS = '<span style="padding-left:' + nIndent + 'px; ' + (($(originalElement).attr('nLevel') == 1) ? 'font-weight: 900;' : '') + '">' + element.text + '</span>';

	var $element = $(
			sCSS);

	return $element;
};

//var sMUNBase = '';
var sParamName = '';

define(['jquery', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/js/select2.min.js'], function ($) {

	function CustomSelect2() {};

	CustomSelect2.prototype.draw = function (oControlHost) {
		sParamName = oControlHost.configuration['paramName'];
		var oParameter = oControlHost.getParameter(sParamName.toString());
		var sParameterValue = (oParameter && (oParameter.values.length > 0)) ? oParameter.values[0].use : "";
		var sTextValue = sParameterValue.split(".").pop().replace(/^\[(.+)\]$/, '$1');
		var nameDataSet = oControlHost.control.dataStores[0];
		var levelDataSet = oControlHost.control.dataStores[1];
		var munDataSet = oControlHost.control.dataStores[2];
		var iRowCount = nameDataSet.rowCount;
		var iPriorLevel = levelDataSet.getCellValue(0, 0);
		var sHTML = '<select class="js-example-basic-single" name="state" style="width: 200px;">';
		var el = oControlHost.container;
		$(el).append('<select class="js-example-basic-single" name="state" style="width: 200px;"></select>');

		for (var iRow = 0; iRow < iRowCount; iRow++) {
			var sValue = nameDataSet.getCellValue(iRow, 0);
			var nLevel = levelDataSet.getCellValue(iRow, 0);
			var sMun = munDataSet.getCellValue(iRow, 0);
			var nNextLevel = levelDataSet.getCellValue(((iRow < iRowCount - 1) ? iRow + 1 : iRow), 0);
			//console.log('Current Element:' + sValue + ' Current Level:' + nLevel + ' Next Level:' + nNextLevel);
			$('.js-example-basic-single')
			.append($("<option level=" + nLevel + ((sValue == sTextValue) ? ' selected="selected"' : '') + ((nLevel < nNextLevel) ? ' nLevel=1' : ' nLevel=0') + " mun='" + sMun +"'></option>")
				.attr("value", sValue)
				.text(sValue));
		}

		$('.js-example-basic-single').on('select2:select', function () {
			oControlHost.valueChanged();
			oControlHost.next();
		});

		$('.js-example-basic-single').select2({
			templateResult: formatElement
		});

	}

	CustomSelect2.prototype.setData = function (oControlHost, oDataStore) {
		this.m_oDataStore = oDataStore;
	};

	CustomSelect2.prototype.getParameters = function () {
		var sValue = $('.js-example-basic-single').find(':selected').attr('mun');
		return [{
				"parameter": sParamName.toString(),
				"values": [{
						"use": sValue
					}
				]
			}
		];
	};

	return CustomSelect2;
});