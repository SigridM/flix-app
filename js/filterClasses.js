/* A simple Boolean filter with a Checkbox  */
export class Filter {
  /* Create an instance of this class that sets its baseID (a String), used for identifying and creating elements
     in the DOM */
  constructor(baseID) {
    this.baseID = baseID;
    this.addStringConstants();
    this.addChangeListener();
  }

  /* Keep all the strings in one place; these are the defaults for a generic checkbox filter */
  stringConstants = {
    divIDExtension: '-div',
    checkboxIDExtension: '-filter-checkbox',

    popUpClassName: 'popup-menu',

    changeEvent: 'change',
    clickEvent: 'click',

    blockStyle: 'block',
    hiddenStyle: 'none',
  };

  /*  Add or modify string constants */
  addStringConstant(key, value) {
    this.stringConstants[key] = value;
  }

  /* Add the string constants for a generic checkbox filter: the IDs of the main elements */
  addStringConstants() {
    /* Addthe name in the DOM of the div element that encloses this entire filter */
    this.addStringConstant(
      'enclosingDivID',
      this.baseID + this.stringConstants.divIDExtension
    );
    /* Add the name in the DOM of the checkbox for this filter */
    this.addStringConstant(
      'checkboxID',
      this.baseID + this.stringConstants.checkboxIDExtension
    );
  }

  /* Answer the div element from the DOM that encloses this entire filter */
  enclosingDiv() {
    return document.getElementById(this.stringConstants.enclosingDivID);
  }

  /* Answer the input element from the DOM that is the checkbox for this filter */
  checkbox() {
    return document.getElementById(this.stringConstants.checkboxID);
  }

  /* Uncheck the checkbox */
  uncheck() {
    this.checkbox().checked = false;
  }

  /* Deselect this filter and clear its state */
  clear() {
    this.uncheck();
  }

  /* Answer a Boolean, whether this filter is active */
  isFiltered() {
    return this.checkbox().checked;
  }

  /* Set the checked state of this filter's checkbox to aBoolean */
  setFiltered(aBoolean) {
    this.checkbox().checked = aBoolean;
  }

  /* Add a function that will react to a change of the checkbox's state: for a simple filter, just close any other
       popUpMenus on the page */
  addChangeListener() {
    const filterCheckbox = this.checkbox();
    filterCheckbox.addEventListener(this.stringConstants.changeEvent, () => {
      this.closeOtherPopUps();
    });
  }

  /* For compatibility with menu filters, answer the popUpMenu, which is null for simple filters */
  popUpMenu() {
    return null;
  }

  /* Search the DOM for all popUpMenus and return them in an Array */
  allPopUps() {
    return Array.from(
      document.getElementsByClassName(this.stringConstants.popUpClassName)
    );
  }

  /* Search the DOM for all popUpMenus. Close them all so only the popUpMenu for this filter (if there is one)
     can show. */
  closeOtherPopUps() {
    const myPopUp = this.popUpMenu();
    this.allPopUps().forEach((popUp) => {
      if (popUp !== myPopUp) {
        this.hideElement(popUp);
      }
    });
  }

  /* Close (hide) all of the popUpMenus in the DOM */
  closeAllPopUps() {
    this.allPopUps().forEach((popUp) => {
      this.hideElement(popUp);
    });
  }

  /* Hide the DOM element by changing its style */
  hideElement(element) {
    element.style.display = this.stringConstants.hiddenStyle;
  }

  isHidden(element) {
    return element.style.display === this.stringConstants.hiddenStyle;
  }

  /* Show the DOM element by changing its style to the block style*/
  showElementAsBlock(element) {
    element.style.display = this.stringConstants.blockStyle;
  }

  /* Show the entire filter */
  show() {
    this.enclosingDiv().style.display = this.stringConstants.blockStyle;
  }

  /* Hide the entire filter */
  hide() {
    this.enclosingDiv().style.display = this.stringConstants.hiddenStyle;
  }

  /* End Filter class */
}

/* A Filter that displays a popUpMenu when the checkbox is checked, but only one option at a time can be
     selected in the menu */
export class SingleChoiceMenuFilter extends Filter {
  /* Create an instance of this class that sets its baseID (a String), used for identifying and creating elements
     in the DOM; and the options for filtering (an Array of Strings) that will be shown in the popUpMenu */
  constructor(baseID, options) {
    super(baseID);
    this.options = options;
    this.setSelected([]); // this will only ever have at most one item in it, but subclasses will use for multiple selections
    this.createFilterElements();
    this.moveSelectedToTop();
  }

  /* Add the string constants for a filter containing a popUpMenu */
  addStringConstants() {
    super.addStringConstants();

    /* Add the element tags that will be added to or identified in the DOM */
    this.addStringConstant('divElementTag', 'div');
    this.addStringConstant('unorderedListElementTag', 'ul');
    this.addStringConstant('listItemElementTag', 'li');
    this.addStringConstant('anchorTag', 'a');

    /* Add the ID extensions for elements specific to the popUpMenu and clarifier */
    this.addStringConstant('popUpIDExtension', '-popupMenu');
    this.addStringConstant('labelIDExtension', '-label');
    this.addStringConstant('popUpContainerIDExtension', '-container');
    this.addStringConstant('singleClarifierIDExtension', '-single-clarifier');
    this.addStringConstant('closeMenuItemIDExtension', '-close-menu-list-item');

    /* Add IDs specific to a filter with a popUpMenu */
    /* Add the name for creating and finding in the DOM the popUpMenu for this filter*/
    this.addStringConstant(
      'popUpID',
      this.baseID + this.stringConstants.popUpIDExtension
    );
    /* Add the name in the DOM of the interactive checkbox label for this filter */
    this.addStringConstant(
      'labelID',
      this.baseID + this.stringConstants.labelIDExtension
    );
    /* Add the name in the DOM for creating and finding the menu item that sits at the top of the popUpMenu
        and closes the popUpMenu for this filter */
    this.addStringConstant(
      'closeMenuItemID',
      this.baseID + this.stringConstants.closeMenuItemIDExtension
    );
    /* Add the name in the DOM of the div that will hold the popUpMenu for this filter */
    this.addStringConstant(
      'popUpContainerID',
      this.baseID + this.stringConstants.popUpContainerIDExtension
    );
    /* Add the name in the DOM for creating and finding the div that shows clarifying text 
            for what is selected in the popUpMenu for this filter when one and only one item is selected */
    this.addStringConstant(
      'singleClarifierID',
      this.baseID + this.stringConstants.singleClarifierIDExtension
    );

    /* Add the class of a single clarifier, for styling */
    this.addStringConstant('singleClarifierClass', 'single-clarifier');

    /* Add classes and text specific to menu items */
    this.addStringConstant(
      'unselectedListItem',
      'a:not(.selected):not(.close-x):not(.close-text)'
    );
    this.addStringConstant('selectedClass', 'selected');
    this.addStringConstant('separatorClass', 'separator');
    this.addStringConstant(
      'separatorSelector',
      '.' + this.stringConstants.separatorClass
    );
    this.addStringConstant('filterMenuItemClass', 'filter-menu-item');
    this.addStringConstant('emptyHRef', '#');
    this.addStringConstant('closeMenuItemTextClass', 'close-text');
    this.addStringConstant('closeMenuItemXClass', 'close-x');

    this.addStringConstant('closeMenuItemCloseText', 'Close');
    this.addStringConstant('closeMenuItemXText', 'X');

    /* Add another style for showing elements */
    this.addStringConstant('inlineBlockStyle', 'inline-block');

    /* Add styling text for positioning the menu */
    this.addStringConstant('absolutePositioning', 'absolute');
    this.addStringConstant('pixels', 'px');
  }

  /* Create and return a new instance of this class that sets the name (a String) and options (an Array of Strings), 
     but also the selections (also an Array of Strings) */
  static withSelections(baseID, options, selections) {
    const answer = new this(baseID, options);
    // const listItems = Array.from(
    //   answer.popUpMenu().querySelectorAll(answer.stringConstants.listItemElementTag)
    // ).filter((li) => selections.includes(li.textContent));
    // listItems.forEach((li) =>
    //   li
    //     .querySelector(stringConstants.anArray)
    //     .classList.add(stringConstants.selectedClass)
    // );
    answer.setSelectedListItemAnchorTextFrom(selections);
    return answer;
  }

  /* Answer an Array of all the Strings selected in the popUpMenu */
  getSelected() {
    return this.selected;
  }

  /* Answer a Boolean, whether any of the popUpMenuItems are selected */
  hasSelected() {
    return this.getSelected().length > 0;
  }

  /* Answer the div element from the DOM behaves as a popUpMenu for this filter */
  popUpMenu() {
    return document.getElementById(this.stringConstants.popUpID);
  }

  /* Answer the anchor element from the DOM serves as the interactive label for the checkbox of this filter */
  label() {
    return document.getElementById(this.stringConstants.labelID);
  }

  /* Answer the anchor element from the DOM of that acts as menu item and sits at the top of the popUpMenu
     and closes the popUpMenu for this filter */
  closeMenuItem() {
    return document.getElementById(this.stringConstants.closeMenuItemID);
  }

  /* Answer the div element from the DOM that will hold the popUpMenu for this filter */
  popUpContainer() {
    return document.getElementById(this.stringConstants.popUpContainerID);
  }

  /* Answer the div element from the DOM that contains text clarifying what is selected in the popUpMenu
       for this filter when one and only one item is selected in the menu*/
  singleClarifier() {
    return document.getElementById(this.stringConstants.singleClarifierID);
  }

  /* Answer the function used to sort the options in the popUpMenu */
  sortFunction() {
    return this.textContentSort.bind(this);
  }

  /* For sorting listItems alphabetically by their textContent, answer -1, 0, or 1, which mean
     a comes before b, a and b are equal, or a comes after b, respectively. */
  textContentSort(a, b) {
    if (a.textContent > b.textContent) {
      return -1; // Return -1 to indicate 'a' should come before 'b'
    }
    if (a.textContent < b.textContent) {
      return 1; // Return 1 to indicate 'b' should come before 'a'
    }
    return 0; // Return 0 if they are equal
  }

  /* Deselect this filter and clear its state */
  clear() {
    if (this.isFiltered()) {
      this.clearSelected();
    }
    this.uncheck();
  }

  /* Unselect everything in the popUpMenu and rearrane the popUpMenu according to the sort function */
  clearSelected() {
    this.getSelectedListItemAnchors().forEach((ea) => {
      ea.classList.remove(this.stringConstants.selectedClass); // turn off selected
    });

    this.moveSelectedToTop(); // reorder all the unselected; reset the selected instance variable
  }

  /* Answer the unordered list that lives inside the popUpMenu div */
  popUpMenuUnorderedList() {
    return this.popUpMenu().querySelector(
      this.stringConstants.unorderedListElementTag
    );
  }
  /* Answer an Array of all of the selected listItem anchors in the popUpMenu */
  getSelectedListItemAnchors() {
    const ul = this.popUpMenuUnorderedList();
    return Array.from(
      ul.getElementsByClassName(this.stringConstants.selectedClass)
    );
  }

  /* Set the selected listItem anchors in the popUpMenu to contain the given selections, 
     an Array of strings. */
  setSelectedListItemAnchorTextFrom(selections) {
    const listItems = Array.from(
      this.popUpMenu().querySelectorAll('li')
    ).filter((li) => selections.includes(li.textContent));
    listItems.forEach((li) =>
      li
        .querySelector(this.stringConstants.anchorTag)
        .classList.add(this.stringConstants.selectedClass)
    );
    this.moveSelectedToTop();
  }

  /* Answer an Array of all of the unselected listItems in the popUpMenu, not including the close menu item */
  getUnselectedListItemAnchors() {
    const ul = this.popUpMenuUnorderedList();
    return Array.from(
      ul.querySelectorAll(this.stringConstants.unselectedListItem)
    );
  }

  /* Set the selected text to the strings in the given Array */
  setSelected(anArray) {
    this.selected = anArray;
  }

  /* The selection in the popUpMenu has changed. Rearrange the popUpMenu items so the selected are at the top, 
       the unselected at the bottom, and if there are both selected and unselected, a separator line in between them. 
       Keep the close menu item at the very top. Sort both the selected and unselected according to the sort function.  
       Modify the clarifying text to reflect the current state of the selection. 
       Note that because items are added to the top of the list using the insertBefore() function on an unordered
       list, everything must be added in reverse order.*/
  moveSelectedToTop() {
    const popUpMenu = this.popUpMenu();
    const ul = popUpMenu.querySelector('ul');

    // Sort the items in reverse alphabetical order so they can be re-added from the bottom up
    let selectedItems = this.getSelectedListItemAnchors().sort(
      this.sortFunction()
    );
    let unselectedItems = this.getUnselectedListItemAnchors().sort(
      this.sortFunction()
    );

    // Remove the unselected items and re-add them in alphabetical order
    unselectedItems.forEach((ea) => {
      ul.removeChild(ea.parentNode);
      ul.insertBefore(ea.parentNode, ul.firstChild);
    });

    // Remove the selected items and re-add them in alphabetical order above the unselected items
    selectedItems.forEach((ea) => {
      ul.removeChild(ea.parentNode);
      ul.insertBefore(ea.parentNode, ul.firstChild);
    });

    // Make sure the close menu item is at the very top
    const closeMenuItem = this.closeMenuItem();
    ul.removeChild(closeMenuItem);
    ul.insertBefore(closeMenuItem, ul.firstChild);

    // Check or uncheck the checkbox associated with this menu based on whether there
    // are any selected items
    this.checkbox().checked = selectedItems.length > 0;

    // Add a separator line if needed
    // First remove the old separator, if there is one
    const separator = ul.querySelector(this.stringConstants.separatorSelector);
    if (separator) {
      ul.removeChild(separator);
    }

    // Add a separator if there are both selected and unselected items
    if (selectedItems.length > 0 && unselectedItems.length > 0) {
      const lastSelectedItem = selectedItems[0]; // remember selectedItems are in reverse order;
      const nextListItem = lastSelectedItem.parentNode.nextElementSibling;

      // Add a separator line
      const separator = document.createElement(
        this.stringConstants.listItemElementTag
      );
      separator.className = this.stringConstants.separatorClass;
      ul.insertBefore(separator, nextListItem);
    }

    //cache selected strings
    this.setSelected(
      selectedItems
        .sort(this.sortFunction.bind(this))
        .reverse()
        .map((ea) => ea.textContent)
    );

    this.clarifySelected();
  }

  /* Add a function that will react to a change of the checkbox's state: for a menu filter, it will 
       show the popUpMenu and, if the checkbox is unchecked, clear any menu selections. It will do
       this for both a change of the checkbox and a click on the checkbox label */
  addChangeListener() {
    const filterCheckbox = this.checkbox();
    filterCheckbox.addEventListener(this.stringConstants.changeEvent, () => {
      this.openPopUpMenu();

      if (!filterCheckbox.checked) {
        this.clearSelected();
        setTimeout(this.closeOtherPopUps.bind(this), 500); // is this necessary?
      }
    });

    this.label().addEventListener(this.stringConstants.clickEvent, () => {
      this.togglePopUpMenu();
    });
  }

  /* Initialize the popUpMenu and any refinements of the filter, like text clarifying what is selected 
     in the popUpMenu.  */
  createFilterElements() {
    this.createPopUpMenu();
    this.createSingleClarifier();
  }

  togglePopUpMenu() {
    const popUpMenu = this.popUpMenu();
    const wasHidden = this.isHidden(popUpMenu);

    this.closeAllPopUps();

    if (wasHidden) {
      this.positionPopUpMenu();
      this.showElementAsBlock(popUpMenu);
    }
  }

  /* Create and return a div that acts as a pop-up menu for this filter. It contains an unordered
     list, which contains list items for all of the filter options. */
  newPopUpMenu() {
    const div = document.createElement(this.stringConstants.divElementTag);
    div.classList.add(this.stringConstants.popUpClassName);
    div.id = this.stringConstants.popUpID;
    const list = document.createElement(
      this.stringConstants.unorderedListElementTag
    );
    const closeItem = this.newCloseMenuItem();
    list.appendChild(closeItem);
    this.options.forEach((option) => {
      const item = this.newMenuItem(option);
      list.appendChild(item);
    });
    div.appendChild(list);
    // div.style.display = 'block'; // show the menu
    return div;
  }

  /* Create and return a list item for the top of the menu that has a couple of anchors
     for the user to click on to close the entire menu: one anchor has the text 'Close'; 
     the other has a stylized X. */
  newCloseMenuItem() {
    const closeTextAnchor = document.createElement(
      this.stringConstants.anchorTag
    );
    closeTextAnchor.href = this.stringConstants.emptyHRef;
    closeTextAnchor.classList.add(this.stringConstants.closeMenuItemTextClass);
    closeTextAnchor.textContent = this.stringConstants.closeMenuItemCloseText;
    closeTextAnchor.addEventListener(
      this.stringConstants.clickEvent,
      (event) => {
        this.closeMenu(event);
      }
    );

    const closeXAnchor = document.createElement(this.stringConstants.anchorTag);
    closeXAnchor.href = this.stringConstants.emptyHRef;
    closeXAnchor.classList.add(this.stringConstants.closeMenuItemXClass);
    closeXAnchor.textContent = this.stringConstants.closeMenuItemXText;
    closeXAnchor.addEventListener(this.stringConstants.clickEvent, (event) => {
      this.closeMenu(event);
    });

    const closeListItem = document.createElement(
      this.stringConstants.listItemElementTag
    );
    closeListItem.id = this.stringConstants.closeMenuItemID;
    closeListItem.appendChild(closeTextAnchor);
    closeListItem.appendChild(closeXAnchor);
    return closeListItem;
  }

  /* Create and return a listItem containing an anchor that can be clicked whose text content is the given filter optionText, 
     a String */
  newMenuItem(optionText) {
    const anchor = document.createElement(this.stringConstants.anchorTag);
    anchor.href = this.stringConstants.emptyHRef;
    anchor.classList.add(this.stringConstants.filterMenuItemClass);
    anchor.textContent = optionText;

    anchor.addEventListener(this.stringConstants.clickEvent, (event) => {
      event.preventDefault();
      this.menuItemSelected(event.target);
      this.moveSelectedToTop();
    });

    const optionListItem = document.createElement(
      this.stringConstants.listItemElementTag
    );
    optionListItem.appendChild(anchor);
    return optionListItem;
  }

  /* Remove from the given menuItem the selected class */
  deselectMenuItem(menuItem) {
    menuItem.classList.remove(this.stringConstants.selectedClass);
  }

  /* Add to the given menuItem the selected class */
  selectMenuItem(menuItem) {
    menuItem.classList.add(this.stringConstants.selectedClass);
  }

  /* Answer a Boolean, whether the given menuItem has the selected class */
  isSelected(menuItem) {
    return menuItem.classList.contains(this.stringConstants.selectedClass);
  }

  /* Respond to a list item being selected because its anchor was clicked. For a single choice menu filter,
     this means deselecting all selected items and toggling the clicked-on item (selecting it if it wasn't) */
  menuItemSelected(listItemAnchor) {
    const wasSelected = this.isSelected(listItemAnchor);
    this.getSelectedListItemAnchors().forEach((ea) => {
      this.deselectMenuItem(ea);
    });
    if (!wasSelected) {
      this.selectMenuItem(listItemAnchor);
    }
  }

  /* Close this filter's popUpMenu */
  closeMenu(event) {
    event.preventDefault();
    this.closePopUpMenu();
  }

  positionPopUpMenu() {
    const labelRect = this.label().getBoundingClientRect();
    const popUpDiv = this.popUpMenu();
    popUpDiv.style.position = this.stringConstants.absolutePositioning;
    popUpDiv.style.top = labelRect.top + this.stringConstants.pixels;
    popUpDiv.style.left = labelRect.right + 10 + this.stringConstants.pixels;
  }

  /* Show the popUpMenu for this filter in the DOM, hiding all other popUpMenus */
  openPopUpMenu() {
    this.closeOtherPopUps();
    this.positionPopUpMenu();
    this.showElementAsBlock(this.popUpMenu());
  }

  /* Hide the popUpMenu for this filter in the DOM */
  closePopUpMenu() {
    this.hideElement(this.popUpMenu());
  }

  /* Create anew the div that serves as the popUpMenu for this filter and add it 
     to the DOM, but hidden, to be opened (shown) later. */
  createPopUpMenu() {
    const popUpDiv = this.newPopUpMenu();

    const container = this.popUpContainer();
    container.appendChild(popUpDiv);
    this.hideElement(popUpDiv);
  }

  /* Answer the String that is the display style for the single clarifier of this filter. 
     Because, as a single choice filter, we either have a selection or we don't, show the
     clarifier only if we have a selection. */
  singleClarifierDisplayStyle() {
    return this.hasSelected()
      ? this.stringConstants.inlineBlockStyle
      : this.stringConstants.hiddenStyle;
  }

  /* Set the content and display style of the div that clarifies what is selected in the popUpMenu */
  clarifySelected() {
    const clarifier = this.singleClarifier();
    clarifier.textContent = this.singleClarifierContent();
    clarifier.style.display = this.singleClarifierDisplayStyle();
  }

  /* Answer a String, the text that goes into the single clarifier */
  singleClarifierContent() {
    return this.hasSelected() ? '(' + this.getSelected()[0] + ')' : '';
  }

  /* The single clarifier div does not yet exist in the DOM. Create it and add it to the popUpMenu container
     for this filter */
  createSingleClarifier() {
    const clarifier = document.createElement(
      this.stringConstants.divElementTag
    );
    clarifier.id = this.stringConstants.singleClarifierID;
    clarifier.classList.add(this.stringConstants.singleClarifierClass);

    this.popUpContainer().appendChild(clarifier);
    this.hideElement(clarifier);
    // this.clarifySelected();
  }

  // End SingleChoiceMenuFilter class
}
/* MultipleChoiceMenuFilter allows multiple selections in its popUpMenu and shows how those selections will be combined
   in the final filter. By default, they will be combined using 'or'. */
export class MultipleChoiceMenuFilter extends SingleChoiceMenuFilter {
  /* Answer a String, the name in the DOM of the div containing the div showing clarifying text for 
     what is selected in the popUpMenu for this filter and how the selections are combined when more 
     than one item is selected */

  /* Add the string constants for a filter containing multiple selections */
  addStringConstants() {
    super.addStringConstants();

    /* Add the name in the DOM for creating and finding the div element that contains the div shows clarifying text 
       for what is selected in the popUpMenu for this filter and how the selections are combined when more than one item 
       is selected */
    this.addStringConstant('combinerID', this.baseID + '-combiner');

    /* Add the name in the DOM for creating and finding the div showing clarifying text for what is selected in the 
       popUpMenu for this filter and how the selections are combined when more than one item is selected */
    this.addStringConstant(
      'combinerClarifierID',
      this.baseID + '-combiner-clarifier'
    );

    /* Add class names for styling the combiner and clarifier */
    this.addStringConstant('combinerClassName', 'combiner');
    this.addStringConstant('clarifierClassName', 'clarifier');

    this.addStringConstant('combineUsingOr', 'or');
  }

  /* Answer the div element from the DOM that contains the div shows clarifying text for what is selected in the 
     popUpMenu for this filter and how the selections are combined when more than one item is selected */
  combiner() {
    return document.getElementById(this.stringConstants.combinerID);
  }

  /* Answer the div element from the DOM that shows clarifying text for what is selected in the 
     popUpMenu for this filter and how the selections are combined when more than one item is selected */
  combinerClarifier() {
    return document.getElementById(this.stringConstants.combinerClarifierID);
  }

  /* Initialize the popUpMenu and any refinements of the filter, like and/or radio buttons and text 
     clarifying what is selected in the popUpMenu. 
     This overrides the superclass method of the same name because this one adds a combiner clarifier */
  createFilterElements() {
    this.createPopUpMenu();
    this.createCombiner();
    this.createSingleClarifier();
  }

  /* Respond to a list item being selected because its anchor was clicked. For a multiple choice menu filter,
     this means simply toggling the selection state of the clicked-on anchor */
  menuItemSelected(listItemAnchor) {
    listItemAnchor.classList.toggle(this.stringConstants.selectedClass);
  }

  /* Answer the String used to combine options for this filter. Because we don't have and-or choices, the only way to
     combine options is with 'or' */
  getCombineUsing() {
    return this.stringConstants.combineUsingOr;
  }

  /* Answer a Boolean, true if one and only one item is selected in the popUpMenu */
  hasSingleSelection() {
    return this.getSelected().length === 1;
  }

  /* Answer a Boolean, true if more than one item is selected in the popUpMenu */
  hasMultipleSelection() {
    return this.getSelected().length > 1;
  }

  /* Answer the String that is the display style for the single clarifier of this filter. 
     This will depend on how many items are selected in the popUpMenu. If one and only one, show the 
     clarifier. If zero, displaying it is not necessary. If more than one, hide the single clarfier
     and show a more detailed combiner clarifier */
  singleClarifierDisplayStyle() {
    return this.hasSingleSelection()
      ? this.stringConstants.inlineBlockStyle
      : this.stringConstants.hiddenStyle;
  }

  /* Answer the String that is the display style for the combiner clarifier of this filter. 
     This will depend on how many items are selected in the popUpMenu. If more than one, show the 
     clarifier. Otherwiser, show either the singleClarifier [for one selection; see 
     #singleCLarifierDisplayStyle()] or no clarifier at all (for no selection). */
  combinerDisplayStyle() {
    return this.hasMultipleSelection()
      ? this.stringConstants.inlineBlockStyle
      : this.stringConstants.hiddenStyle;
  }

  /* Show clarifying text in the DOM for how multiple selections will be combined; give it an
     inlineBlockStyle because its container will be hidden or shown, as needed */
  clarifyCombinedSelected() {
    const combinerClarifier = this.combinerClarifier();
    combinerClarifier.textContent = this.combinerClarifierText();
    combinerClarifier.style.display = this.stringConstants.inlineBlockStyle;
  }

  /* Answer a String that is the clarifying text for how multiple selections will be combined */
  combinerClarifierText() {
    return (
      '(' + this.getSelected().join(' ' + this.getCombineUsing() + ' ') + ')'
    );
  }

  /* Set the content and display style of the divs that clarifies what is selected in the popUpMenu. 
     This can be the single clarifier as in the superclass, and also the combiner clarifier if there
     is more than one selection */
  clarifySelected() {
    super.clarifySelected();
    this.clarifyCombinedSelected();
    this.combiner().style.display = this.combinerDisplayStyle();
  }

  /* Create and add to the DOM a div that holds the combiner clarifier (a div that, in turn, shows the
     user how their multiple selections in the popUpMenu will be combined) */
  createCombiner() {
    const combiner = document.createElement(this.stringConstants.divElementTag);
    combiner.id = this.stringConstants.combinerID;
    combiner.classList.add(this.stringConstants.combinerClassName);

    combiner.appendChild(this.newCombinerClarifier());

    this.popUpContainer().appendChild(combiner);
    this.hideElement(combiner);
    // this.clarifyCombinedSelected();
  }

  /* Create and return a div that will hold the text showing the user how their multiple choices in the
     popUpMenu will be combined */
  newCombinerClarifier() {
    const combinerClarifier = document.createElement(
      this.stringConstants.divElementTag
    );
    combinerClarifier.id = this.stringConstants.combinerClarifierID;
    combinerClarifier.classList.add(this.stringConstants.clarifierClassName);
    return combinerClarifier;
  }
  /* End MultpleChoiceFilter class */
}

/* A Filter that allows multiple choice selections in the popUpMenu and also allows those choices to be combined
   with either 'and' or 'or' */
export class AndOrMultipleChoiceMenuFilter extends MultipleChoiceMenuFilter {
  /* Override the superclass constructor because this filter allows the combiner to be set by the user */
  constructor(baseID, options) {
    super(baseID, options);
    this.combineUsing = 'or'; // default combiner choice
  }

  /* Add the string constants for a filter containing combination choices for multiple selections */
  addStringConstants() {
    super.addStringConstants();

    /* Add the character combinations that is used in the API to represent how options are joined */
    this.addStringConstant('andJoinString', '%2C');
    this.addStringConstant('orJoinString', '%7C');

    /* Add the option for combining using and */
    this.addStringConstant('combineUsingAnd', 'and');

    /* Add UI text for choosing combiners */
    this.addStringConstant('combineUsingText', '- combine using: ');
    this.addStringConstant('andText', ' And ');
    this.addStringConstant('orText', ' Or ');

    this.addStringConstant('inputElementTag', 'input');
    this.addStringConstant('labelElementTag', 'label');
    this.addStringConstant('radioType', 'radio');

    this.addStringConstant(
      'choiceRadioButtonName',
      this.baseID + '-combine-using'
    );
  }

  /* Create and return a new instance of this class that sets the name (a String) and options (an Array of Strings), 
     but also the selections (also an Array of Strings) and the phrase with which to combine selections (combiningString,
     a String) */
  static withSelectionsAndCombiner(
    baseID,
    options,
    selections,
    combiningString
  ) {
    const answer = this.withSelections(baseID, options, selections);
    answer.setCombineUsing(combiningString);
    return answer;
  }

  /* Answer how to combine the options when there is more than one selected in the popUpMenu */
  getCombineUsing() {
    return this.combineUsing;
  }

  getCombineUsingAnd() {
    return document.getElementById(
      this.baseID + '-' + this.stringConstants.combineUsingAnd
    );
  }

  getCombineUsingOr() {
    return document.getElementById(
      this.baseID + '-' + this.stringConstants.combineUsingOr
    );
  }

  /* In response to a radio button selection, set how to combine the options when there is more than one selected in the popUpMenu*/
  setCombineUsing(aString) {
    this.combineUsing = aString;
    if (aString === this.stringConstants.combineUsingAnd) {
      this.getCombineUsingAnd().checked = true;
    }
    if (aString === this.stringConstants.combineUsingOr) {
      this.getCombineUsingOr().checked = true;
    }
    this.combinerClarifier().textContent = this.combinerClarifierText();
  }

  /* Answer a String, the character combination that is used in the API to represent how options are joined */
  getJoinString() {
    return this.getCombineUsing() === this.stringConstants.combineUsingOr
      ? this.stringConstants.orJoinString
      : this.stringConstants.andJoinString;
  }

  /* Create and return a single radio button with the choice (set to the choiceString parameter) 
     of how to combine the filter options for this filter when more than one item is selected in the popUpMenu */
  newCombinationChoice(choiceString) {
    const choice = document.createElement(this.stringConstants.inputElementTag);
    choice.type = this.stringConstants.radioType;
    choice.id = this.baseID + '-' + choiceString;
    choice.name = this.stringConstants.choiceRadioButtonName;
    choice.value = choiceString;
    choice.checked = true;
    choice.addEventListener(this.stringConstants.changeEvent, (event) => {
      this.setCombineUsing(event.target.value);
    });
    return choice;
  }

  /* Create and return the label for a radio button that allows the choice of how to combine the filter options for 
     this filter when more than one item is selected in the popUpMenu */
  newCombinationLabel(choice, labelString) {
    const label = document.createElement(this.stringConstants.labelElementTag);
    label.for = choice.id;
    label.textContent = labelString;
    return label;
  }

  /* Override the superclas method for creating a combiner. This one is more complicated because we allow the user
     to choose how to combine the options in the popUpMenu: either with 'and' or 'or'. We add the radio buttons for
     those choices before adding the combiner clarifier. */
  createCombiner() {
    const combiner = document.createElement(this.stringConstants.divElementTag);
    combiner.id = this.stringConstants.combinerID;
    combiner.classList.add(this.stringConstants.combinerClassName);
    combiner.textContent = this.stringConstants.combineUsingText;

    const andChoice = this.newCombinationChoice(
      this.stringConstants.combineUsingAnd
    );
    const andLabel = this.newCombinationLabel(
      andChoice,
      this.stringConstants.andText
    );

    const orChoice = this.newCombinationChoice(
      this.stringConstants.combineUsingOr
    );
    const orLabel = this.newCombinationLabel(
      orChoice,
      this.stringConstants.orText
    );

    combiner.appendChild(andChoice);
    combiner.appendChild(andLabel);
    combiner.appendChild(orChoice);
    combiner.appendChild(orLabel);
    combiner.appendChild(this.newCombinerClarifier());

    this.popUpContainer().appendChild(combiner);
    // this.clarifyCombinedSelected();
    this.hideElement(combiner);
  }

  /* End AndOrMultipleChoiceFilter */
}
/* A Filter that allows multiple choice selections in the popUpMenu, allows those choices to be combined
   with either 'and' or 'or', and also allows the menu items to be populated dynamically */
export class DynamicAndOrMultipleChoiceMenuFilter extends AndOrMultipleChoiceMenuFilter {
  constructor(baseID, options, repopulateFunction) {
    super(baseID, options);
    // this.keyWordObjects = [];
    this.repopulateFunction = repopulateFunction;
  }

  addStringConstants() {
    super.addStringConstants();

    /* Add the character combinations that is used in the API to represent how options are joined */
    // @to-do These should really be set from the outside, since they have more to do with the API
    // than the class
    this.addStringConstant('andJoinString', ',');
    this.addStringConstant('orJoinString', '|');
  }

  /* Open the popUpMenu. Override the superclass method to first repopulate the menu items
   dynamically. This happens in setSelectedListItemAnchorTextFrom(), which also resets the 
   selected items. */
  async openPopUpMenu() {
    // await this.repopulatePopUpMenu();
    this.setSelectedListItemAnchorTextFrom(this.selected);
    super.openPopUpMenu();
  }

  /* Set the items selected in the menu from the Array of strings in the selections
     parameter. Override the superclass method to repopulate the menu first. */
  async setSelectedListItemAnchorTextFrom(selections) {
    await this.repopulatePopUpMenu();
    super.setSelectedListItemAnchorTextFrom(selections);
  }

  /* Toggle the popUpMenu: if it is open, close it and vice versa. Override the superclass
     method to repopulate the menu items dynamically before reopening the menu. This happens 
     in setSelectedListItemAnchorTextFrom(), which also resets the selected items. */
  async togglePopUpMenu() {
    const popUpMenu = this.popUpMenu();
    const wasHidden = this.isHidden(popUpMenu);

    this.closeAllPopUps();
    // await this.repopulatePopUpMenu();
    this.setSelectedListItemAnchorTextFrom(this.selected);

    if (wasHidden) {
      this.positionPopUpMenu();
      this.showElementAsBlock(popUpMenu);
    }
  }

  /* Set the options in the popUpMenu to the Array of Strings in the newOptions parameter. */
  setOptions(newOptions) {
    this.options = newOptions;
  }

  /* Remove the contents of the popUpMenu and replace them according to
    the repopulateFunction. This happens asynchronously since the
    options are coming from the API. */
  async repopulatePopUpMenu() {
    this.options = await this.repopulateFunction();
    const popUpMenu = this.popUpMenu();
    popUpMenu.innerHTML = '';

    const list = document.createElement(
      this.stringConstants.unorderedListElementTag
    );
    const closeItem = this.newCloseMenuItem();
    list.appendChild(closeItem);
    this.options.forEach((option) => {
      const item = this.newMenuItem(option);
      list.appendChild(item);
    });
    popUpMenu.appendChild(list);
  }
}
