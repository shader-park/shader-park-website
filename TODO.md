
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
	- culling

- Permissions for users
	- lock shaders while actively editing
