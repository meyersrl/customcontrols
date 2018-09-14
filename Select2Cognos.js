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

var munDataSet;
var sParamName = '';
var sIdentifier = '';
var nKey;

define(['jquery', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/js/select2.min.js'], function ($) {

	function CustomSelect2() {};

	CustomSelect2.prototype.draw = function (oControlHost) {
		
		sParamName = oControlHost.configuration['paramName'];
		sWidth = oControlHost.configuration['width'];
		var oParameter = oControlHost.getParameter(sParamName.toString());
		var sParameterValue = (oParameter && (oParameter.values.length > 0)) ? oParameter.values[0].use : "";
		var nameDataSet = oControlHost.control.dataStores[0];
		var levelDataSet = oControlHost.control.dataStores[1];
		munDataSet = oControlHost.control.dataStores[2];
		var iRowCount = nameDataSet.rowCount;
		var iPriorLevel = levelDataSet.getCellValue(0, 0);
		sIdentifier = sParamName + '_Select2';
		var sHTML = '<select class="'+ sIdentifier +'"style="width:' + sWidth + ';" ></select>';
		var el = oControlHost.container;
		$(el).append(sHTML);

		for (var iRow = 0; iRow < iRowCount; iRow++) {
			var sValue = nameDataSet.getCellValue(iRow, 0);
			var nLevel = levelDataSet.getCellValue(iRow, 0);
			var sMUN = munDataSet.getCellValue( iRow, 0);
			var nNextLevel = levelDataSet.getCellValue(((iRow < iRowCount - 1) ? iRow + 1 : iRow), 0);
			//console.log('Current Element:' + sValue + ' Current Level:' + nLevel + ' Next Level:' + nNextLevel);
			$('.' + sIdentifier)
			.append($("<option level=" + nLevel + ((sMUN == sParameterValue) ? ' selected="selected"' : '') + ((nLevel < nNextLevel) ? ' nLevel=1' : ' nLevel=0') + " key=" + iRow +"></option>")
				.attr("value", sValue)
				.text(sValue));
		}

		$('.' + sIdentifier).on('select2:select', function (event) {
			nKey = parseInt($(event.currentTarget).find("option:selected").attr('key'));
			oControlHost.valueChanged();
			oControlHost.next();
		});

		$('.' + sIdentifier).select2({
			templateResult: formatElement
		});
	}

	CustomSelect2.prototype.setData = function (oControlHost, oDataStore) {
		this.m_oDataStore = oDataStore;
	};

	CustomSelect2.prototype.getParameters = function (oControlHost) {
		var sParamName = oControlHost.configuration['paramName'];
		var sValue = oControlHost.control.dataStores[2].getCellValue(nKey, 0);
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
