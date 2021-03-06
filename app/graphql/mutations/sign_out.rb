# frozen_string_literal: true

module Mutations
  class SignOut < Mutations::BaseMutation
    graphql_name "SignOut"

    field(:user, Types::UserType, null: false);

    def resolve
      user = context[:current_user]
      puts "user: #{user}"
      if user.present?
        success = user.reset_authentication_token!
        context[:current_user] = nil

        MutationResult.call(
          obj: { user: user },
          success: success,
          errors: user.errors
        )
      else
        GraphQL::ExecutionError.new("User not signed in")
      end
    end
  end
end
