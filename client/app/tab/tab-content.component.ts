import {Input, Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {TabContentService} from './tab-content.service';
import { DomSanitizer, SafeUrl} from '@angular/platform-browser';

import {Tab} from './tab.component';
import {Tabs} from '../tabs/tabs.component';

import {VideoService} from '../video/video.service';

import {User} from '../user/user';
import {UserService} from '../user/user.service';

declare var videojs: any;

@Component({
	selector: 'ready',
	template: ``,
	providers: [VideoService]
})
export class Ready implements AfterViewInit{
	@Input('index') index:number;
	constructor(
		private _videoService: VideoService){
	}
	ngAfterViewInit(){
		console.log(this.index);
		this._videoService.makeRecorder()//this.index)
	}
}

@Component({ selector: 'tab-content', 
	templateUrl: 'app/tab/tab-content.component.html',
	styleUrls: ['app/tab/tab-content.component.css'],
	providers: [VideoService]
})

export class TabContent implements OnInit {
	public files = <any>[];
	public activeTab: any;
	public allQuestionVideos = <any>[];
	public answerVideo: any;
	public questionVideo: any;
	public selectedQuestion = <any>[];
	public questionText: any;

	public userModel: User;

	public errorMessage: string;

	constructor(private _tabContentService: TabContentService,
			   private _videoService: VideoService,
			   private _userService: UserService,
			   private sanitizer: DomSanitizer){

		//when ready to set this.userModel, it will do so
		this._userService.user$.subscribe(userModel => {
			this.userModel = userModel[0];
			console.log(this.userModel);
		} );

		//this is REALLY important
		this._userService.loadUser();
	}

	changeTab(title: string){
		console.log("changing tab to = ", title);
		this.activeTab = true;
	}

	logout(){
		this._userService.unloadUser();
	}

	getUser(){
		return this._userService.getUserModel();
	}

	getContent() {
		this._tabContentService.getTabContent()
		.subscribe((pages:any) => {
			var i: number;
			for(i = 0; i < pages.length; ++i){
				this.files[i] = {
					title: pages[i].Title,
					content: pages[i].Content
				};
				//defaults to the first one
				if(i == 0){
					this.files[i].active = true;
				}
			}
	    },
	    error => this.errorMessage = <any>error
        );
	}

	// This will get the 'public' videos, meaning the video questions
	getPublicVideos(){
		console.log("in get public videos");

		this._videoService.getPublicVideos()
			.subscribe(res=>{
				for(var i = 0; i < res.length; i++){
					this.allQuestionVideos.push(res[i]);

					if (i == 0)
					{
						console.log("setting default questions and answers");
						this.setSelectedQuestion(this.allQuestionVideos[0]._id);
						this.setQuestionAndAnswer(this.allQuestionVideos[0]._id);
					}
				}
			

			});

		

		console.log("all Videos = ", this.allQuestionVideos);
	}

	setSelectedQuestion(questionID: string) {
		console.log("getting selected question");

		//Loops through all avaliable videos and grabs the selected one
		for (var i = 0; i < this.allQuestionVideos.length; i++){
			if (questionID == this.allQuestionVideos[i]._id){
				console.log("i = ", i, "question id = ", this.allQuestionVideos[i]._id);
				console.log("questions id url = ", this.allQuestionVideos[i].path);

				//This wasnt chaning the source properly
				this.selectedQuestion[0] = this.allQuestionVideos[i];
				this.questionText = this.selectedQuestion[0]._id;

				this.questionVideo = this.allQuestionVideos[i];

				//This properly changes the source of the videojs player
				console.log("selectedQuestion from inside select q = ", this.selectedQuestion)
				
				break;
			}
		}

		/*if (!isQSet) {
			this.selectedQuestion = new Array(0);
		}*/
	}

	//Gets a question based on the questionID
	getQuestion(questionID: string){
		console.log("In get questions want id = ", questionID);
		console.log("selectedQuestion length = ", this.selectedQuestion.length);
		console.log("selectedQuestion[0] = ", this.selectedQuestion[0]);
		console.log("selectedQuestion = ", this.selectedQuestion);


		//Checks to make sure the videojs player is visible, if not, it wont work
		if (this.selectedQuestion.length > 0){
			var vid = videojs("qvideo");
			console.log(vid);
		}

		
		console.log("questionData = ", this.allQuestionVideos);
		

		/*var vid: any;

		for (var i = 0; i < 50000; i++) {
			try {
				vid = videojs("qvideo")
			} catch (error) {
				vid = null;
			}
		}*/

		console.log("selected q len = ", this.selectedQuestion.length);
		
		if (this.selectedQuestion.length > 0 && vid){
			console.log("setting question src to: ", this.selectedQuestion[0].path);
			vid.src({"type":"video/mp4", "src": 'https://debianvm.eecs.wsu.edu' + this.selectedQuestion[0].path});
		}
	}

	setQuestionAndAnswer(questionID: string){
		console.log("in set q and a");

		var setA = false;

		if (this.selectedQuestion.length > 0)
		{
			var answer = this._videoService.getYourAnswers(questionID);
			console.log("after getting answer, before setting src");
			console.log("answer = ", answer);
			
			answer.subscribe(res=>{
				if (res != undefined){
					console.log("res = ", res);
					//this.answervideoData.push(res);
					this.answerVideo = res;
					console.log("answerVideo = ", this.answerVideo.path);

					var avid = videojs("avideo");
					console.log("setting answer src to: ", res.path);
					avid.src('https://debianvm.eecs.wsu.edu' + res.path);
					setA = true;

					console.log("making a new recorder");
					this._videoService.makeRecorder();

				}
			});

			// Set Question
			var qvid = videojs("qvideo");
			console.log("setting question src to: ", this.selectedQuestion[0].path);
			qvid.src('https://debianvm.eecs.wsu.edu' + this.selectedQuestion[0].path);

			var avid = videojs("avideo");

			// Set Answer if not set already
			if (!setA)
			{
				console.log("making a new recorder");
					this._videoService.makeRecorder();
				//this._videoService.makeRecorder();

				console.log("setting answer src to: ");
				avid.src("");
			}

			avid.errors({
			errors: {
				4: {
				headline: `There is no saved video for this answer.
				Please go to the questions tab and record a new video, or chang the questions from the dropdown menu.`,
				type: 'No Video Saved'
				}
			}
			});


		 	console.log("leving set answer func");
		}
	}

	getCanSave(index: number){
		var canSave = false;
		canSave = this._videoService.canSave[index];
		return canSave;
	}

	saveVideoAnswer() {
		console.log("Saving");
		this._videoService.saveRecording(this.selectedQuestion[0]._id);
		//var base = this.getBase(this.selectedQuestion[0].path);
		//console.log("saving..");
		//this._videoService.saveAnswer(1, base, this.selectedQuestion[0].isPublic, this.selectedQuestion[0].questionID);
	}


	deleteVideoAnswer(){
		console.log("deleting..");
		this.answerVideo = [];
		this._videoService.deleteAnswer(this.selectedQuestion[0].questionID);
	}

	private getBase(path: string){
		var l = path.split("/");
		var x = l[l.length - 1];
		var y = x.substring(0, x.indexOf('.'));

		return y;
	}

	ngOnInit(){
		this.getContent();
		this.getPublicVideos();
	}
}
