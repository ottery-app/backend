package userStates;

import human.User;

public class Guardian {
	User user;
	
	public Guardian(User user) {
		this.setUser(user);
	}
	
	private void setUser(User user) {
		this.user = user;
	}
	
	public String getUsername() {
		return this.user.getUsername();
	}
}
