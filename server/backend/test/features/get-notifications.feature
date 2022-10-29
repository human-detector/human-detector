Feature: Getting notifications

Scenario: Using a valid ID with 2 notifications to get
	Given I have a valid ID
	And the ID has 2 notifications associated with it
	When I request to get the notifications
	Then the request will go through
	And I will receive a Notification array of 2

Scenario: Using an ID I do not have access to with 1 notification to get
	Given I have camera A's details
	And camera A has 1 notification
	And camera B is registered
	When I request to get the notifications from camera A with camera B's token
	Then the request will receive a 'Forbidden' error
	And camera A will still have 1 notification

Scenario: Trying to get notifications from a camera with 1 notification without any credentials
	Given I have no credentials
	And camera A has 1 notification attributed to it
	When I try to get the notification from camera A
	Then I will receive a 'Forbidden' error
	And Camera A will have the same notification as before

Scenario: Trying to get notifications from a camera that is not registered
	Given I have no registered credentials
	When I try to get notifications from a camera that is not registered
	Then I will receive a 'Forbidden' error