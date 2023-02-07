Feature: Deleting a group

Scenario: Deleting a group with 1 camera in it
  Given I have a valid group ID and 1 camera attached to it
  When I request to delete the group
  Then I will receive a Conflict Error
  And the group will still be active

Scenario: Deleting a group with no cameras in it
  Given I have a valid group ID
  And the group has no cameras associated with it
  When I request to delete the group
  Then the group will be deleted

Scenario: Deleting a group with an invalid group ID
  Given I have an invalid group ID
  When I request to delete the group
  Then I will receive a Forbidden Error