Feature: Register a group to a user

    Scenario: User is registering their camera from the app
        Given I have credentials
        When I register the group through the app
        Then I receive the group ID
        And the group is registered

    Scenario: User A is attempting to register a camera to User B
        Given I have user A's credentials
        When I register the group to user B
        Then I receive an unauthorized error

    Scenario: User A is attempting to register a group to a non-existant User B
        Given I have user A's credentials
        When I register the camera to user B
        Then I receive an unauthorized error

    Scenario: User is attempting to register a group with
