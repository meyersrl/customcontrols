define( 
  [   "jquery"
    
  ]
  , function(jQuery) {
    "use strict"; 

    function expandCollapse(){};

    expandCollapse.prototype.initialize = function( oControlHost, fnDoneInitializing ){
      
    var o = oControlHost.configuration
      , list = oControlHost.page.getControlByName(o["listName"])
      , listElm = list.element
      ;

      


if(o["type"]==1){
/*there are a million and ten ways of expecting a list to support expand/collapse.
 * this method assumes the developer is using a list, grouping on what he wants to collapse
 * and is using group headers. The developer also needs to put an HTML item with:
 * <span class="expand">
 * into the cell. 
 *
 * the script looks for all instances of that span and goes to the next cell down
 * to find the rowSpan. Once it finds that it loops through the currentRow (with 
 * the expand span) including all of the rows covered by the rowSpan hiding them. It also
 * sets a new attribute called "parent" which includes the hierarchy of the cells.
 * this parent attribute is then used to show/hide the cells (not the rows because rowSpan
 * is stupid and messes everything up).
 * 
 * get all that? good. Explain it to me later when I try to understand what I was thinking
 *
 */
$(listElm).find('tr:has(span[class="expand"])').each(
  function() {
    var r = this.rowIndex
      , a = this.nextSibling.firstChild.rowSpan;
    
    for (var i=r+1;i<r+a+1;++i){
      var id = $(this).find('td:has(span[class="expand"])')[0].id
      $(listElm.rows[i]).find('TD').attr(
          'parent'
        , function(){
          return $(this).attr('parent')? $(this).attr('parent')+id +'|': id+'|'
        }
      );
      $(listElm.rows[i]).find('TD').hide();
    }
      
    
  }
);

  
}

if(o["type"]==2){
/* There are a million and nine ways of expecting a list to support expand/collapse.
 * This method assumes the developer is using a crosstab, with an item on each row, 
 * and left padding used to set up the hierarchies.
 * The developer also needs to put an HTML item with:
 * <span class="expand">
 * into the cell. 
 *
 * the script looks for all instances of that span, checks that cells left padding, and 
 * goes to the next cell down to check the padding there. If the left padding is greater,
 * then it determines that it's a child row, and adds it's ID to the parent list. If the 
 * left padding is the same or less, it's a new category and stops processing. 
 * 
 * If it doesn't find any children, it removes the expand box from the row.
 *
 * Once the parent has been set, it hides the row.
 * 
 * get all that? good. Explain it to me later when I try to understand what I was thinking
 *
 */
 
 
 
 //attach parent attribute
$(listElm).find('tr:has(span[class="expand"])').each(
  function() {
    var r = this.rowIndex
      , a = listElm.rows.length
      , lpad = parseInt($($(this).find('th:has(span[class="expand"])')[0]).css('padding-left'))
      , itr=0;
      ;
	  console.log('Left padding:' + lpad);
      
    
    if(r+1==a) $(this).find('span[class="expand"]').remove();
    for (var i=r+1;i<a;++i){
      var id = $(this).find('td:has(span[class="expand"])')[0].id
        , td = $(listElm.rows[i]).find('TD')
       

      if(parseInt($(td[0]).css('padding-left'))<=lpad) {
        if(itr==0) $(this).find('span[class="expand"]').remove();
        i=a;
      }
      else {
        ++itr;
        $(td).attr(
            'parent'
          , function(){
          return $(this).attr('parent')? $(this).attr('parent')+id+'|': id+'|'
        }
      );
      }
      $(listElm.rows[i]).find('TD').hide();
    }
      
    
  }
);


  
}

$(listElm).find('span[class="expand"]').text('+ ');

var tds = $(listElm).find('td:has(span[class="expand"])');
tds.css( 'cursor', 'pointer' );
tds.attr( 'state', 'expand' );

$(listElm).find('td:has(span[class="expand"])').click(function(){
  var p = $(this).attr('parent')?$(this).attr('parent'):'';
 
  if($(this).attr('state')=='expand'){
    $(listElm).find('TD[parent="'+p+this.id+'|"]').show(200);
    $(this).attr('state','collapse');
    $(this).find('span[class="expand"]').text('- ');
  }
  else {
    
    $(listElm).find('TD[parent*="'+this.id+'|"]').hide(200);
    $(listElm).find('TD[parent*="'+this.id+'|"]:has(span[class="expand"])').attr('state','expand');
    $(this).find('span[class="expand"]').text('+ ');
    $($(listElm).find('TD[parent*="'+this.id+'|"]:has(span[class="expand"])')).find('span[class="expand"]').text('+ ');
    
    $(this).attr('state','expand');
    
  }
});  
    
      sessionStorage.setItem(this.ctrlFrom+'secondaryRun',1);
      
      
      fnDoneInitializing();
      
    };

    return expandCollapse;
  }
);