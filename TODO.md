
## Backend
- Make it
- Database schema + sort (Redis?)
- Permissions for users
	- __could__ issue hashcodes/passwords to allow the original author to edit their own shader while keeping the shader readonly for everyone else
	- lock shaders while actively editing

## Frontend
- basic Camera/player controls
- the Room/Park
	- nice, subtle shading: AO?
	- grid layout?
		 - helps collisions
		 - could be infinite
- Network
	- show other players
	- smooth interpolation between updates
- the Sculptures
	- multiple shaders
	- bounding boxes/spheres
	- depth magic
	- handle bad shaders
		- priortize faster to load shaders
		- load balencing
	- player interaction (editing, creating)
	- editor
		- still need to be able to move camera
			- modal editing
		- HTML editor for now
			- [CodeMirror](http://codemirror.net)
		- compile/save(push to database) buttons
	- culling
	
- Social media features  
	- "like" objects

- Permissions for users
	- lock shaders while actively editing


## Schema + Protocol

grid of Sculptures, (x,y) coordinates

### Sculptures
- key: coordinate string
- name
- shader source
- author
- active editing flag
+ create/modify
* updating a scuplture pushs a message to each client invalidating that shader

### Player
- location 
- orientation?
- id/name
- sculpture edit status
- timeout?

- lowish time resolution for polling server: 200ms
	- sends player state
	- poll response should be any updates from the server (other player states)
- modified shader sends out invalidation message to clients
