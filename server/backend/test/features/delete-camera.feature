Feature: Deleting a camera and it's notifications

Scenario: Deleting a camera with 0 notifications
  Given I have a valid camera ID
  And the camera has no notifications associated with it
  When I request to delete the camera
  Then the camera will be deleted
  And the camera is no longer on the backend

Scenario: Deleting a camera with 2 notifications
  Given I have a valid camera ID
  And the camera has 2 notifications associated with it
  When I request to delete the camera
  Then the camera will be deleted
  And the notifications will also be deleted
  And the camera is no longer on the backend

Scenario: Trying to delete a camera that does not exist
  Given I have an invalid camera ID
  When I request to delete the camera
  Then a 'Forbidden' error will be received