module Api
  module V1
    class AdminController < ApiApplicationController
      before_action :is_admin
      def remove
        admin = User.find(params[:id])
        admin.remove_role :admin
        if admin.remove_role :admin
          render json: {status: 'SUCCESS', message: 'Removed admin role from '+admin.email, data:admin.hashid},status: :ok
        else
          render json: {status: 'ERROR', message: 'Role not saved', data:admin.errors},status: :unprocessable_entity
        end
      end

      def add
        user = User.find_by_email(params[:email])
        if user.add_role :admin
          render json: {status: 'SUCCESS', message: 'Added admin role to '+user.email, data:{id: user.hashid, email: user.email}},status: :ok
        else
          render json: {status: 'ERROR', message: 'Role not saved', data:user.errors},status: :unprocessable_entity
        end
      end
    end

    def email
        EmailRiderMailer.send_email(@user).deliver_now
    end
  end
end
