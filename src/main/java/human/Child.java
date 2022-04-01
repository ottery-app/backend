package human;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class Child {
	private UUID uuid;
	private Human genericInfo;
	private String allergies;
	private String specialNeeds;
	private String additionalInfo;
	private ArrayList<String> events;
	private String primaryGuardian;
	private ArrayList<String> guardians;
	
	public Child(String uuid) {
		try {
			JSONParser parser = new JSONParser();
			JSONObject jsonObject = (JSONObject)parser.parse(new FileReader("data/children/" + uuid.toString() + ".json"));
			
			this.setUuid(uuid);
			this.genericInfo = new Human(
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
			this.setAllergies((String)jsonObject.get("allergies"));
			this.setSpecialNeeds((String)jsonObject.get("specialNeeds"));
			this.setAdditionalInfo((String)jsonObject.get("additionalInfo"));
			this.setPrimaryGuardian((String)jsonObject.get("primaryGuardian"));
		} catch (IOException | ParseException e) {
			System.out.println(e.getMessage());
		}
	}

	private void setPrimaryGuardian(String string) {
		this.primaryGuardian = string;	
	}

	public Child(Map<String, Object> payLoad) throws Exception {
		this.setUuid((String)payLoad.get("uuid"));
		File childFile = new File("data/children/" + this.uuid.toString() + ".json");
		
		if (childFile.exists()) {
			throw new Exception("this child already exists");
		}
		
		this.genericInfo = new Human(payLoad);
		this.setPrimaryGuardian((String)payLoad.get("username")); //this is the guardian
		this.setAllergies((String)payLoad.get("allergies"));
		this.setSpecialNeeds((String)payLoad.get("specialNeeds"));
		this.setAdditionalInfo((String)payLoad.get("additionalInfo"));
		this.update();
	}
	
	private void setAdditionalInfo(String additionalInfo) {
		this.additionalInfo = additionalInfo;
		
	}

	private void setSpecialNeeds(String specialNeeds) {
		this.specialNeeds = specialNeeds;
		
	}

	private void setUuid(String uuid) {
		if (uuid == null || uuid.equals("")) {
			this.uuid = UUID.randomUUID();
		} else {
			this.uuid = UUID.fromString(uuid);
		}
	}
	
	public UUID getUuid() {
		return this.uuid;
	}
	
	private void setAllergies(String allergies) {
		this.allergies = allergies;
	}
	
	@SuppressWarnings("unchecked")
	public String toJSONString() {
		JSONObject childInfo = new JSONObject();
		childInfo.put("uuid", this.uuid.toString());
		genericInfo.getInfo().forEach((k, v) -> childInfo.put(k, v));
		
		childInfo.put("allergies", this.allergies);
		childInfo.put("specialNeeds", this.specialNeeds);
		childInfo.put("additionalInfo", this.additionalInfo);
		
		try {
			String events = null;
			for (int i = 0; i < this.events.size(); i++)
	            events = events == null ? this.events.get(i) : events + "," + this.events.get(i);
			childInfo.put("events", events);
		} catch (Exception e) {
			System.out.println("no events to add");
		}
		
		childInfo.put("primaryGuardian", this.primaryGuardian);
		
		try {
			String guardians = null;
			for (int i = 0; i < this.guardians.size(); i++)
	            guardians = guardians == null ? this.guardians.get(i) : guardians + "," + this.guardians.get(i);
			childInfo.put("guardians", guardians);
		} catch (Exception e) {
			System.out.println("no guardians to add");
		}
		
		return childInfo.toJSONString();
	}
	
	public void update() {
		try {
			File userFile = new File("data/children/" + this.uuid.toString() + ".json");
			FileWriter file = new FileWriter(userFile);
			file.write(this.toJSONString());
			file.close();
		} catch (Exception e) {
			System.out.println("error in update");
			System.out.println(e.getMessage());
		}
	}
}
