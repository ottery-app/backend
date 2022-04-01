/**
 * 
 */
package human;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.Map;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

/**
 * @author lewibs
 */
public class User {	
	private String validStates;
	private String currentState;
	private String username;
	private String password;
	private String token;
	private Human user;
	
	/**
	 * this is for when a new user is created. That is the only time that it is called
	 * @param payLoad
	 * @throws Exception
	 */
	public User(Map<String, Object> payLoad) throws Exception {
		this.setUsername((String)payLoad.get("username"));
		File userFile = new File("data/users/" + this.getUsername() + ".json");
		
		if (userFile.exists()) {
			throw new Exception("this user already exists");
		}
		
		this.setUsername((String)payLoad.get("username"));
		this.setPassword((String)payLoad.get("password"));
		this.user = new Human(
				(String)payLoad.get("firstName"),
				(String)payLoad.get("lastName"),
				(String)payLoad.get("middleName"),
				(String)payLoad.get("gender"),
				(String)payLoad.get("date"),
				(String)payLoad.get("country"),
				(String)payLoad.get("address"),
				(String)payLoad.get("city"),
				(String)payLoad.get("state"),
				(String)payLoad.get("zip"),
				(String)payLoad.get("phone"),
				(String)payLoad.get("email"));
	}
	
	public User(String username, String password) throws Exception {
		JSONParser parser = new JSONParser();
		JSONObject jsonObject = (JSONObject)parser.parse(new FileReader("data/users/" + username + ".json"));
		
		this.setPassword((String)jsonObject.get("password"));
		this.validatePassword(password);
		this.user = new Human(
				(String)jsonObject.get("firstName"),
				(String)jsonObject.get("lastName"),
				(String)jsonObject.get("middleName"),
				(String)jsonObject.get("gender"),
				(String)jsonObject.get("date"),
				(String)jsonObject.get("country"),
				(String)jsonObject.get("address"),
				(String)jsonObject.get("city"),
				(String)jsonObject.get("state"),
				(String)jsonObject.get("zip"),
				(String)jsonObject.get("phone"),
				(String)jsonObject.get("email"));
		this.setUsername((String)jsonObject.get("username"));
		this.setCurrentState((String)jsonObject.get("currentState"));
		this.setValidStates((String)jsonObject.get("validStates"));
	}

	public String getValidStates() {
		return validStates;
	}

	public void setValidStates(String validStates) {
		this.validStates = validStates;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = "" + password.hashCode();
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public String getCurrentState() {
		return currentState;
	}

	public void setCurrentState(String currentState) {
		this.currentState = currentState;
	}
	
	@SuppressWarnings("unchecked")
	public String toJSONString() {
		JSONObject userInfo = new JSONObject();
		userInfo.put("email", this.getEmail());
		userInfo.put("username", this.getUsername());
		userInfo.put("password", this.getPassword());
		userInfo.put("firstName", this.getFirstName());
		userInfo.put("middleName", this.getMiddleName());
		userInfo.put("lastName", this.getLastName());
		userInfo.put("gender", this.getGender());
		userInfo.put("dob", this.getDob());
		userInfo.put("country", this.getCountry());
		userInfo.put("address", this.getAddress());
		userInfo.put("city", this.getCity());
		userInfo.put("state", this.getState());
		userInfo.put("zip", this.getZip());
		userInfo.put("phone", this.getPhone());
		userInfo.put("validStates", this.getValidStates());
		userInfo.put("currentState", this.getCurrentState());
		//DONT HAVE TOKEN HERE?????
		
		return userInfo.toJSONString();
	}

	private String getPhone() {
		return this.user.getPhone();
	}

	private String getZip() {
		return this.user.getZip();
	}

	private String getState() {
		return this.user.getState();
	}

	private String getCity() {
		return this.user.getCity();
	}

	private String getAddress() {
		return this.user.getAddress();
	}

	private String getCountry() {
		return this.user.getCountry();
	}

	private String getDob() {
		return this.user.getDob();
	}

	private String getGender() {
		return this.user.getGender();
	}

	private String getLastName() {
		return this.user.getLastName();
	}

	private String getFirstName() {
		return this.user.getFirstName();
	}

	private String getMiddleName() {
		return this.user.getMiddleName();
	}

	private String getEmail() {
		return this.user.getEmail();
	}

	private void validatePassword(String password) throws Exception {
		//this looks odd but it works. don't ask because idk why it works...
		if (!password.equals("dummyToken")) {
			if (password.equals(this.getPassword())) {
				throw new Exception("passwords dont match");
			}
		}
	}
	
	public void update() {
		try {
			File userFile = new File("data/users/" + this.getUsername() + ".json");
			FileWriter file = new FileWriter(userFile);
			file.write(this.toJSONString());
			file.close();
		} catch (Exception e) {
			System.out.println("error in update");
			System.out.println(e.getMessage());
		}
	}
	
	public void addState(String state) {
		try {
			String validStates = this.getValidStates();
			if (!state.equals("guardian") && !state.equals("director") && !state.equals("orginization")) {
				throw new Exception("not a valid state");
			} else if (validStates!=null && (validStates.contains("guardian") || validStates.contains("director") || validStates.contains("orginization"))) {
				throw new Exception("state already exists");
			}
			
			this.setValidStates(((this.getValidStates() == null) ? "" : this.getValidStates() + ",") + state);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}