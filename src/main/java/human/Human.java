package human;

import java.util.HashMap;
import java.util.Map;

public class Human {
	private String firstName;
	private String lastName;
	private String middleName;
	private String gender;
	private String dob;
	private String country;
	private String address;
	private String city;
	private String state;
	private String zip;
	private String email;
	private String phone;
	
	public Human(String firstName, String lastName, String middleName, String gender, String dob, String country,
			String address, String city, String state, String zip, String phone, String email) {
		this.setFirstName(firstName);
		this.setLastName(lastName);
		this.setMiddleName(middleName);
		this.setGender(gender);
		this.setDob(dob);
		this.setCountry(country);
		this.setAddress(address);
		this.setCity(city);
		this.setState(state);
		this.setZip(zip);
		this.setEmail(email);
		this.setPhone(phone);
	}
	
	public Human(Map<String, Object> payLoad) {
		this((String)payLoad.get("firstName"),
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

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	
	public String getFirstName() {
		return this.firstName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	
	public String getLastName() {
		return this.lastName;
	}

	public void setMiddleName(String middleName) {
		this.middleName = middleName;
	}
	
	public String getMiddleName() {
		return this.middleName;
	}
	
	public void setGender(String gender) {
		this.gender = gender;
	}
	
	public String getGender() {
		return this.gender;
	}

	public void setDob(String dob) {
		this.dob = dob;
	}
	
	public String getDob() {
		return this.dob;
	}

	public void setCountry(String country) {
		this.country = country;
	}
	
	public String getCountry() {
		return this.country;
	}

	public void setAddress(String address) {
		this.address = address;
	}
	
	public String getAddress() {
		return this.address;
	}

	public void setCity(String city) {
		this.city = city;
	}
	
	public String getCity() {
		return this.city;
	}

	public void setState(String state) {
		this.state = state;
	}
	
	public String getState() {
		return this.state;
	}

	public void setZip(String zip) {
		this.zip = zip;
	}
	
	public String getZip() {
		return this.zip;
	}
	
	public void setEmail(String email) {
		this.email = email;
	}
	
	public String getEmail() {
		return this.email;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}
	
	public String getPhone() {
		return this.phone;
	}
	
	public HashMap<String, String> getInfo() {
		HashMap<String, String> info = new HashMap<String, String>();
		info.put("phone", this.phone);
		info.put("zip", this.zip);
		info.put("state", this.state);
		info.put("city", this.city);
		info.put("address", this.address);
		info.put("country", country);
		info.put("dob", this.dob);
		info.put("gender", this.gender);
		info.put("lastName", this.lastName);
		info.put("firstName", this.firstName);
		info.put("middleName", this.middleName);
		info.put("email", this.email);
		return info;
	}
}
