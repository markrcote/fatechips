class ApplicationController < ActionController::Base
  # FIXME: remove this at some point.
  protect_from_forgery with: :null_session
end
