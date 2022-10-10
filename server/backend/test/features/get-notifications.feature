Feature: Getting notifications

Scenario: Using a valid ID with 2 notifications to get
	Given I have a valid ID
	And the ID has 2 notifications associated with it
	When I request to get the notifications
	Then the request will go through
	And I will receive a Notification array of 2

Scenario: Using a valid ID with 0 notifications to get
	Given I have a valid ID
	And the ID has 0 notifications associated with it
	When I request to get the notifications
	Then the request will go through
	And I will receive a Notification array of 0

Scenario: Using an ID I do not have access to with 1 notification to get
	Given I have camera A's details
	And camera A has 1 notification
	And camera B is not registered
	When I request to get the notifications from camera A with camera B's ID
	Then the request will receive an 'Unauthorized' error

Scenario: Trying to get notifications without any credentials
	Given I have no credentials
	And camera A has 1 notification attributed to it
	When I try to get the notification from camera A
	Then I will receive an 'Unauthorized' error
	And Camera A will have the same notification as before
