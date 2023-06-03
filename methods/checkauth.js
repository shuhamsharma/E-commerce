module.exports={
    is_login: function(req,res,next)
    {
        if(req.session.is_log)
        next();
        else
        res.redirect("/login");
    },
    is_admin: function(req,res,next)
    {
        
      if(req.session.role==1||req.session.role==2)
      next();
      else
      res.redirect("/");
    },
    is_user: function(req,res,next)
    {
        if(req.session.role==0||req.session.role==2)
        {
        next();}
        else
        res.redirect("/admin");
    }
}