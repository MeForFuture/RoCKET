import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DataService, Concept } from '../appdata/data.service';
import {forEach} from '@angular/router/src/utils/collection';


@Component({
    selector: 'app-concepts',
    templateUrl: './concepts.component.html',
    styleUrls: ['./concepts.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConceptsComponent implements OnInit {

    concepts: Concept[];
    resultConcepts: Concept[];
    public conceptName;
    public conceptDescription;
    public conceptKeyword: string;
    public conceptShownwords;
    public conceptNameError = "form-control";
    public conceptDescriptionError = "form-control";
    public conceptBody = "";
    public searchByConceptName="form-control search";
    public searchKeyword = "";
    public  keywordlist: string[] = [];
    public  nearestKeywordlist: string[] = [];
    public filterShownWords: string[];
    color = 'accent';
    checked = false;
  constructor(private dataservice: DataService) { }

    ngOnInit() {
        this.getConcepts();
    }
    getConcepts(): void {
        this.dataservice.getConcepts()
            .subscribe(concepts => {
                const len1 = Object.keys(concepts).length;
                console.log('getConcepts', concepts);
                this.concepts = [];
                for ( let i = 0; i < len1; i++) {
                    let concept = new Concept();
                    concept.name = concepts[i]['concept_name'];
                    concept.description = concepts[i]['concept_description'];
                    concept.shown_words = concepts[i]['shown_words'];
                    this.concepts.push(concept);
                }
                this.searchRsult();
            });
    }

  addConcept() {
      if (this.conceptName == '' || !this.conceptName) {
          this.conceptNameError = "form-control error";
      }
      else {
          this.conceptNameError = "form-control";
      }
      if (this.conceptDescription == '' || !this.conceptDescription) {
          this.conceptDescriptionError = "form-control error";
      }
      else {
          this.conceptDescriptionError = "form-control";
      }
      let obj = new Concept();
      if (this.conceptName && this.conceptName != '' && this.conceptDescription && this.conceptDescription != '') {
          obj.name = this.conceptName;
          obj.description = this.conceptDescription;
          obj.shown_words = this.conceptShownwords;
          this.dataservice.concept = obj;
          this.dataservice.addConcept().subscribe(response => {
              this.getConcepts();
          });
          this.conceptName = '';
          this.conceptDescription = '';
      }
  }
    // iron-tiger-start
    showConcept(concept: Concept ) {
        this.conceptName = concept.name;
        this.conceptDescription = concept.description;
        this.conceptShownwords = concept.shown_words;
        console.log('conceptShownwords', this.conceptShownwords);
        this.dataservice.concept = concept;
        this.dataservice.getKeywords().subscribe(response => {
            this.keywordlist = response[0]['keywords'].split(',');
            this.dataservice.keywords = this.keywordlist.join();
            this.dataservice.getNearesKeywords().subscribe(res => {
                const len1 = Object.keys(res).length;
                this.nearestKeywordlist = [];
                for (let i = 0; i < len1; i++ )
                {
                    this.nearestKeywordlist.push(res[i]);
                }
                this.shownWords();
            });
        });

        if(this.conceptName == concept.name || !this.conceptName){
            this.conceptBody = "error";
        }
        else{
            this.conceptBody = "";
        }
    }
    searchRsult(){
      if ( this.searchKeyword != '') {
          this.resultConcepts = this.concepts.filter(
              concept => concept.name === this.searchKeyword);
      }else {
          this.resultConcepts = this.concepts;
      }
        console.log('resultConcepts', this.resultConcepts);
    }
    onKeydown(event) {
        if (event.key === "Enter") {
            this.searchRsult();
       }
    }
    updateConcept(){
        if(this.conceptName == '' || !this.conceptName){
            this.conceptNameError = "form-control error";
        }
        else{
            this.conceptNameError = "form-control";
        }
        if(this.conceptDescription == '' || !this.conceptDescription){
            this.conceptDescriptionError = "form-control error";
        }
        else{
            this.conceptDescriptionError = "form-control";
        }
        let obj = new Concept();
        if(this.conceptName && this.conceptName != ''  && this.conceptDescription && this.conceptDescription != '') {
            obj.name = this.conceptName;
            obj.description = this.conceptDescription;
            this.dataservice.concept = obj;
            this.dataservice.updateConcept().subscribe(response => {
                this.getConcepts();
            });
        }
    }
    deleteConcept(){
        if(this.conceptName == '' || !this.conceptName){
            this.conceptNameError = "form-control error";
        }
        else{
            this.conceptNameError = "form-control";
        }
        if(this.conceptDescription == '' || !this.conceptDescription){
            this.conceptDescriptionError = "form-control error";
        }
        else{
            this.conceptDescriptionError = "form-control";
        }
        if(this.conceptName && this.conceptName !== ''  && this.conceptDescription && this.conceptDescription !== '')
        {

            let obj = new Concept();
            obj.name = this.conceptName;
            obj.description = this.conceptDescription;
            obj.shown_words = this.conceptShownwords;
            this.dataservice.concept = obj;
            this.dataservice.deleteConcept()
                .subscribe(response => {
                    this.getConcepts();
                });
        }
    }
    addKeyword(event){
        if (event.key === "Enter") {
            this.keywordlist.push(this.conceptKeyword);
            this.conceptKeyword = "";
            this.updateKeywords();
        }
    }
    addKeywordBtn(){
        this.keywordlist.push(this.conceptKeyword);
        this.conceptKeyword = "";
        this.updateKeywords();
    }
    updateKeywords() {
      this.dataservice.keywords = this.keywordlist.join();
      this.dataservice.updateKeywords().subscribe(response => {
          this.getConcepts();
      });
    }
    updateShownwords() {
        let obj = new Concept();
        obj.name = this.conceptName;
        obj.description = this.conceptDescription;
        obj.shown_words = this.conceptShownwords;
        this.dataservice.concept = obj;
        this.dataservice.updateShownwords().subscribe(response => {
            console.log('updateShownwords', response);
            this.getConcepts();
        });
    }
    moveKeywords(keyword) {
        this.nearestKeywordlist.splice( this.nearestKeywordlist.indexOf(keyword), 1 );
        this.keywordlist.push(keyword);
        this.updateKeywords();
    }


    shownWords() {
        this.filterShownWords = this.nearestKeywordlist;
        if ( this.checked) {
            console.log('conceptShownwords in toggle', this.conceptShownwords);
            let swords = [];
            swords = this.conceptShownwords.split(',');
            for (let i = 0; i < swords.length; i++) {
                if (this.filterShownWords.indexOf(swords[i]) !== -1) {
                    this.filterShownWords.splice(this.filterShownWords.indexOf(swords[i]), 1);
                }
            }
        }
    }
    // iron-tiger-end
}
