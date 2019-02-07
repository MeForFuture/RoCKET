import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery'
import { DataService, LabelTask } from '../appdata/data.service';

@Component({
    
  selector: 'app-highlights',
  templateUrl: './highlights.component.html',
  styleUrls: ['./highlights.component.css']
})
export class HighlightsComponent implements OnInit {
    labeltask :LabelTask;
    constructor(private dataservice: DataService) { }

    // work-around that requests the labeltask object and creates a temp instance to avoid null data errors (due in part to mixed NG/javascript DOM interaction)
    ngOnInit() { 
        this.labeltask = new LabelTask();
        this.getLabelTask(); 
    }

    // this function uses the mock service to find the next task for the user's concept
    getLabelTask(): void {
        this.dataservice.getNextLabelTask()
        .subscribe(labeltask => this.labeltask = labeltask);
    }

    // submits the highlights with task_id before populating the next task text
    submitTask(label) : void {
        this.labeltask.label = label;
        var highlightresult = [];

        $(".active_text").each(function (index) {
            highlightresult.push($(this).text());
        });
        var label_text = this.labeltask.text;
        var idx = this.labeltask.idx;
        this.dataservice.submitTask(idx, label, highlightresult).subscribe(labeltask => this.labeltask = labeltask);
        $(".text_wrap").each(function (index) {
            ($(this))[0].innerHTML = label_text;
        });
    }

    // this javascript functionality handles highlighting
    ngAfterViewInit() {
        $('.active_text').mouseup(function () {
            return false;
        });
        function removeit() {
            $(".active_text").on("click", function (e) {
                e.preventDefault();
                var wholeHtml = '4.' + $('.text-block-wraper .text_wrap').html();
                var currentHtml = $(this).html();
                var currentIndex = wholeHtml.indexOf($(this).html());
                var startingIndex = currentIndex - 43;
                if (startingIndex >= 0) {
                    var htmlStringClicked = wholeHtml.substr(startingIndex, 43 + currentHtml.length + 7);
                    if (htmlStringClicked.substr(0, 5) == '<span') {
                        var arr = $('.text-block-wraper .text_wrap').html().split(htmlStringClicked);
                        var new_str = arr.join($(this).text());
                        $('.text-block-wraper .text_wrap').html(new_str);
                        removeit();
                    }
                }
            });
        }
        $('.text-block-wraper .text_wrap').mouseup(function () {
            if (getSelectedText() != '') {
                snapSelectionToWord();
                if (!hasClass(getSelectionBoundaryElement(getSelectedText()), 'active_text')) {
                    var span = document.createElement("span");
                    span.setAttribute('_ngcontent-c4', '');
                    span.className = 'active_text';
                    if (window.getSelection) {
                        var sel = window.getSelection();
                        if (sel.rangeCount && (sel as any) != '') {
                            var range = sel.getRangeAt(0).cloneRange();
                            range.surroundContents(span);
                            sel.removeAllRanges();
                            sel.addRange(range);
                            removeit();
                        }
                    }
                }
            }
        });
        function hasClass(target, className) {
            return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
        }
        function snapSelectionToWord() {
            var sel;

            // Check for existence of window.getSelection() and that it has a
            // modify() method. IE 9 has both selection APIs but no modify() method.
            if (window.getSelection && ((sel = window.getSelection()) as any).modify) {
                sel = window.getSelection();
                if (!sel.isCollapsed) {

                    // Detect if selection is backwards
                    var range = document.createRange();
                    range.setStart(sel.anchorNode, sel.anchorOffset);
                    range.setEnd(sel.focusNode, sel.focusOffset);
                    var backwards = range.collapsed;
                    range.detach();

                    // modify() works on the focus of the selection
                    var endNode = sel.focusNode, endOffset = sel.focusOffset;
                    sel.collapse(sel.anchorNode, sel.anchorOffset);

                    var direction = [];
                    if (backwards) {
                        direction = ['backward', 'forward'];
                    } else {
                        direction = ['forward', 'backward'];
                    }

                    sel.modify("move", direction[0], "character");
                    sel.modify("move", direction[0], "character");
                    sel.modify("move", direction[1], "word");
                    sel.extend(endNode, endOffset);
                    sel.modify("extend", direction[1], "character");
                    sel.modify("extend", direction[1], "character");
                    sel.modify("extend", direction[0], "word");
                }
            } else if ((sel = (document as any).selection) && sel.type != "Control") {
                var textRange = sel.createRange();
                if (textRange.text) {
                    textRange.expand("word");
                    // Move the end back to not include the word's trailing space(s),
                    // if necessary
                    while (/\s$/.test(textRange.text)) {
                        textRange.moveEnd("character", -1);
                    }
                    textRange.select();
                }
            }
        }

        function getSelectedText() {
            if (window.getSelection) {
                return window.getSelection().toString();
            } else if ((document as any).selection) {
                return (document as any).selection.createRange().text;
            }
            return '';
        }

        function getSelectionBoundaryElement(isStart) {
            var range, sel, container;
            if ((document as any).selection) {
                range = (document as any).selection.createRange();
                range.collapse(isStart);
                return range.parentElement();
            } else {
                sel = window.getSelection();
                if (sel.getRangeAt) {
                    if (sel.rangeCount > 0) {
                        range = sel.getRangeAt(0);
                    }
                } else {
                    // Old WebKit
                    range = document.createRange();
                    range.setStart(sel.anchorNode, sel.anchorOffset);
                    range.setEnd(sel.focusNode, sel.focusOffset);

                    // Handle the case when the selection was selected backwards (from the end to the start in the document)
                    if (range.collapsed !== sel.isCollapsed) {
                        range.setStart(sel.focusNode, sel.focusOffset);
                        range.setEnd(sel.anchorNode, sel.anchorOffset);
                    }
                }

                if (range) {
                    container = range[isStart ? "startContainer" : "endContainer"];

                    // Check if the container is a text node and return its parent if so
                    return container.nodeType === 3 ? container.parentNode : container;
                }
            }
        }
    }
}
