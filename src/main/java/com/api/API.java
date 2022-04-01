package com.api;

import java.util.Map;

import org.json.simple.JSONObject;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import human.Child;
import human.User;

@CrossOrigin(origins = { "http://localhost:3000" })
@SpringBootApplication
@RestController
public class API {   
	
	public static void main(String[] args) {
		SpringApplication.run(API.class, args);
	}
	
	@PostMapping("/register")
	public String newUser(@RequestBody Map<String, Object> payLoad) throws Exception {
		User user = new User(payLoad);
		user.update();
	    return returnPayload(user.getUsername(), (String)user.getCurrentState());
	}
	
	@PostMapping("/login")
	public String login(
			@RequestBody Map<String, Object> payLoad
	) throws Exception {
	    User user = new User((String)payLoad.get("username"), (String)payLoad.get("password"));
	    return returnPayload(user.getUsername(), (String)user.getCurrentState());
	}
	
	@PostMapping("/addState") 
	public String addState(
			@RequestBody Map<String, Object> payLoad
	) throws Exception {
		User user = new User((String)payLoad.get("username"), (String)payLoad.get("password"));
		user.addState((String)payLoad.get("state"));
		user.setCurrentState((String)payLoad.get("state"));
		user.update();
		return returnPayload(user.getUsername(), user.getCurrentState());
	}
	
	@PostMapping("/validateState") 
	public String validateState(
			@RequestBody Map<String, Object> payLoad
	) {
		System.out.println("need to validate state");
		return "nothing";
	}
	
	@PostMapping("/newChild")
	public void newChild(
		@RequestBody Map<String, Object> payLoad
	) throws Exception {
		//User user = new User((String)payLoad.get("username"), (String)payLoad.get("password"));
		Child child = new Child(payLoad);
		System.out.println("The child uuid should be added to the user (or guardian class?) in newchild api");
		child.update();
	}

	@SuppressWarnings("unchecked")
	private String returnPayload(String username, String state) {
		JSONObject user = new JSONObject();
		JSONObject payload = new JSONObject();
	    user.put("username", username);
	    user.put("state", state);
	    payload.put("user", user.toJSONString());
	    payload.put("token", generateToken());
	    System.out.println(payload.toJSONString());
	    return payload.toJSONString();
	}
	
	private String generateToken() {
		return "dummyToken";
	}
}
