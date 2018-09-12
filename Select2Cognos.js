	function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
	};
	
	loadCss('https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/css/select2.min.css')
	
function formatState (state) {
  if (!state.id) {
    return state.text;
  }
  var originalElement = state.element;
  var nIndent = $(originalElement).attr("Level") * 10;
  var sCSS ='<span style="padding-left:' + nIndent + 'px; ' + (($(originalElement).attr('nLevel')==1)?'font-weight: 900;':'') + '">' + state.text +'</span>';
 
		var $state = $(
    sCSS
	);

  return $state;
};
	
var sMUNBase = '';

define( ['jquery', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.5/js/select2.min.js'], function($) {

	function CustomSelect2() {};
	

	CustomSelect2.prototype.draw = function( oControlHost ) {
		console.log('oControlHost');
		console.log(oControlHost);
		
		var sParamName = oControlHost.configuration['paramName'];
		sMUNBase = oControlHost.configuration['sampleMUN'].split(".").slice(0, -1).join(".");
		var oParameter = oControlHost.getParameter( sParamName.toString() );
		var sMUN = this.m_oDataStore.getCellValue( 0, 0 ).split('.').pop();
		var sParameterValue = ( oParameter && ( oParameter.values.length > 0 ) ) ? oParameter.values[0].use : "";
		var sTextValue = sParameterValue.split(".").pop().replace(/^\[(.+)\]$/,'$1');
		
		
		console.log('Param Value:');
		console.log(sParameterValue);
		
		var nameDataSet = oControlHost.control.dataStores[0];
		var levelDataSet = oControlHost.control.dataStores[1];
		var iRowCount = nameDataSet.rowCount;
		var iPriorLevel = levelDataSet.getCellValue( 0, 0);
		var sHTML = '<select class="js-example-basic-single" name="state" style="width: 200px;">';
		var el = oControlHost.container;
		$(el).append('<select class="js-example-basic-single" name="state" style="width: 200px;"></select>');
		
		for ( var iRow = 0; iRow < iRowCount; iRow++ )
		{
		var sValue = nameDataSet.getCellValue( iRow, 0 );
		var nLevel = levelDataSet.getCellValue( iRow, 0);
		console.log('iRow:' + iRow + ' iRowCount:' +iRowCount);
		var nNextLevel = levelDataSet.getCellValue( ((iRow<iRowCount-1)?iRow+1:iRow), 0);
		console.log('Current Element:' + sValue + ' Current Level:' + nLevel + ' Next Level:' + nNextLevel);
		
		
		$('.js-example-basic-single')
				.append($("<option level=" + nLevel + ((sValue==sTextValue)?' selected="selected"':'') + ((nLevel<nNextLevel)?' nLevel=1':' nLevel=0') + "></option>")
					.attr("value",sValue)
					.text(sValue));
		}
		
			$('.js-example-basic-single').on('select2:select', function() {
			oControlHost.valueChanged();
			oControlHost.next();
			});
		
		
			$('.js-example-basic-single').select2({
			templateResult: formatState
			});
		
	}
		

		
		

	CustomSelect2.prototype.setData = function( oControlHost, oDataStore )
	{
		this.m_oDataStore = oDataStore;
	}	;
	
	CustomSelect2.prototype.getParameters = function()
	{
	var sValue = sMUNBase + '.[' + $('.js-example-basic-single').val() + ']';
	return [{
		"parameter": "pOrg",
		"values": [{ "use" : sValue }]
	}];
	};
	
return CustomSelect2; });

