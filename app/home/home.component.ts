import {Component, OnInit} from '@angular/core';
import {HttpModule, Http} from '@angular/http';

import {FrontContentComponent} from '../front-content/front-content.component';
import {FrontContentService} from '../front-content/front-content.service';

import {User} from '../user/user';
import {UserService} from '../user/user.service';

import {NavbarService} from '../navbar/navbar.service';
import {TabContentService} from '../tab/tab-content.service';

@Component({
	selector: 'home',

	templateUrl: 'app/home/home.component.html',
	styleUrls: ['app/home/home.component.css'],
	providers: [FrontContentService, UserService,
	TabContentService, 
	NavbarService
	]
})

export class HomeComponent implements OnInit {
	public userModel: User;
	public viewable = false;

	constructor(private _userService:UserService){}

	ngOnInit(){
		this.userModel = this._userService.getUserModel();
		console.log(this.userModel);
	}

	changeViewable(){
		if (this.viewable == true)
		{
			this.viewable = false;
		}
		else
		{
			this.viewable = true;
		}
	}
}
